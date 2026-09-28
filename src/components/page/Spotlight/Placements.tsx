"use client";

import { FC, useEffect, useState } from "react";

import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import TableHeading from "@/components/tables/tableHeader";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useSavePlacement, useSpotlightPlacements } from "@/services/hooks/useSpotlight";
import { PageType, Placement } from "@/services/types/spotlight";
import { showToast } from "@/services/utils/toast";

import { Card, EmptyRow, LoadingRow, PAGE_TYPE_LABELS } from "./shared";

const SIZE_PATTERN = /^\d{2,4}x\d{2,4}$/;
const parseSizes = (text: string) =>
  text
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);

const PlacementModal: FC<{ placement: Placement | "new" | null; onClose: () => void }> = ({ placement, onClose }) => {
  const isNew = placement === "new";
  const existing = placement && placement !== "new" ? placement : null;
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pageType, setPageType] = useState<PageType>("medical_library");
  const [sizes, setSizes] = useState("");
  const { mutate: save, isPending } = useSavePlacement();

  useEffect(() => {
    setKey(existing?.key ?? "");
    setName(existing?.name ?? "");
    setDescription(existing?.description ?? "");
    setPageType(existing?.pageType ?? "medical_library");
    setSizes(existing?.sizes.join(", ") ?? "");
  }, [placement, existing]);

  const sizeList = parseSizes(sizes);
  const errors = [
    isNew && !/^[a-z0-9_]{3,60}$/.test(key) ? "Key: 3–60 lowercase letters, numbers or underscores" : null,
    !name.trim() ? "Name is required" : null,
    sizeList.length === 0 || sizeList.some((size) => !SIZE_PATTERN.test(size)) ? "Sizes: comma-separated, like 300x250, 728x90" : null,
  ].filter(Boolean);

  const onSave = () =>
    save(
      {
        id: existing?.id,
        input: isNew
          ? { key, name: name.trim(), description: description.trim() || null, pageType, sizes: sizeList, isActive: true }
          : { name: name.trim(), description: description.trim() || null, sizes: sizeList },
      },
      {
        onSuccess: () => {
          showToast.success("Placement saved", isNew ? "Add the slot to the page in code to start using it." : "Changes apply within a minute.");
          onClose();
        },
        onError: (err) => showToast.error("Unable to save placement", err.message),
      },
    );

  return (
    <Modal isOpen={Boolean(placement)} onClose={onClose} className="max-w-[560px] p-6 rounded-2xl" isFullscreen={false}>
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{isNew ? "New placement" : `Edit ${existing?.key}`}</h3>
        {isNew && (
          <>
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              Key (used in code, can&apos;t be changed later)
              <Input value={key} placeholder="e.g. cpt_detail_sidebar" onChange={(e) => setKey(e.target.value.trim())} />
            </label>
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              Page type
              <Select
                value={pageType}
                options={Object.entries(PAGE_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                onChange={(value: string) => setPageType(value as PageType)}
              />
            </label>
          </>
        )}
        <label className="text-sm text-gray-700 flex flex-col gap-1">
          Name
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="text-sm text-gray-700 flex flex-col gap-1">
          Description
          <TextArea rows={2} value={description} onChange={setDescription} maxLength={300} />
        </label>
        <label className="text-sm text-gray-700 flex flex-col gap-1">
          Sizes
          <Input value={sizes} placeholder="728x90, 320x100" onChange={(e) => setSizes(e.target.value)} />
        </label>
        {errors.length > 0 && (
          <ul className="text-sm text-red-600 list-disc pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isPending || errors.length > 0}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const Placements: FC = () => {
  const { data, isLoading, error } = useSpotlightPlacements();
  const { mutate: save, isPending } = useSavePlacement();
  const [editing, setEditing] = useState<Placement | "new" | null>(null);
  const placements = data?.data ?? [];

  const toggleActive = (placement: Placement) =>
    save(
      { id: placement.id, input: { isActive: !placement.isActive } },
      {
        onSuccess: () =>
          showToast.success(
            placement.isActive ? "Placement turned off" : "Placement turned on",
            placement.isActive ? "No ads will show in this slot." : "Approved ads can show in this slot again.",
          ),
        onError: (err) => showToast.error("Unable to update placement", err.message),
      },
    );

  return (
    <Card
      title="Placements"
      actions={<Button onClick={() => setEditing("new")}>New placement</Button>}
    >
      <p className="px-6 pt-4 text-sm text-gray-500">
        A placement is a slot on a page. Turning one off hides every ad in it immediately; a new placement also needs the slot
        added to the page in code.
      </p>
      <Table>
        <TableHeading
          columns={[
            { key: "placement", label: "Placement" },
            { key: "page", label: "Page" },
            { key: "sizes", label: "Sizes" },
            { key: "campaigns", label: "Campaigns" },
            { key: "status", label: "Status" },
            { key: "action", label: "Action", className: "text-right" },
          ]}
        />
        <TableBody>
          {isLoading && <LoadingRow colSpan={6} />}
          {error && <EmptyRow colSpan={6} message={`Error loading placements: ${error.message}`} />}
          {!isLoading && !error && !placements.length && <EmptyRow colSpan={6} message="No placements yet" />}
          {placements.map((placement) => (
            <TableRow key={placement.id}>
              <TableCell className="py-4 px-4">
                <p className="text-sm text-gray-900 dark:text-white">{placement.name}</p>
                <p className="text-xs text-gray-500 font-mono">{placement.key}</p>
                {placement.description && <p className="text-xs text-gray-500">{placement.description}</p>}
              </TableCell>
              <TableCell className="py-4 px-4 text-sm text-gray-700">{PAGE_TYPE_LABELS[placement.pageType] ?? placement.pageType}</TableCell>
              <TableCell className="py-4 px-4 text-sm text-gray-700">{placement.sizes.join(", ")}</TableCell>
              <TableCell className="py-4 px-4 text-sm text-gray-700">{placement._count?.campaigns ?? 0}</TableCell>
              <TableCell className="py-4 px-4">
                <span className={`text-sm font-medium ${placement.isActive ? "text-green-700" : "text-gray-500"}`}>
                  {placement.isActive ? "On" : "Off"}
                </span>
              </TableCell>
              <TableCell className="py-4 px-4">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(placement)}>
                    Edit
                  </Button>
                  <Button size="sm" variant={placement.isActive ? "outline" : "default"} disabled={isPending} onClick={() => toggleActive(placement)}>
                    {placement.isActive ? "Turn off" : "Turn on"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PlacementModal placement={editing} onClose={() => setEditing(null)} />
    </Card>
  );
};

export default Placements;
