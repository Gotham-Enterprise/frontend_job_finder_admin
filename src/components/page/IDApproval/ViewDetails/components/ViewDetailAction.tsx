import { FC } from "react";

import Button from "@/components/ui/button/Button";

interface Props {
  isLocked: boolean;
}

const ViewDetailAction: FC<Props> = ({ isLocked }) => {
  return (
    <>
      <div className="flex flex-row justify-end gap-4">
        {isLocked && (
          <Button variant="outline" className="border-1 border-green-800 text-green-800">
            Unlock Account
          </Button>
        )}
        <Button>Review ID</Button>
      </div>
    </>
  );
};

export default ViewDetailAction;
