import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@/icons';

interface AccordionProps {
  items: {
    id: string;
    trigger: React.ReactNode;
    content: React.ReactNode;
  }[];
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  collapsible = true,
  defaultValue,
  className = '',
}) => {
  const accordionProps = type === 'single' 
    ? { type: 'single' as const, collapsible, defaultValue: defaultValue as string | undefined }
    : { type: 'multiple' as const, defaultValue: defaultValue as string[] | undefined };

  return (
    <AccordionPrimitive.Root
      className={`w-full ${className}`}
      {...accordionProps}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          className="border-b border-gray-200 dark:border-gray-700"
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-4 text-left font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 rounded-lg group [&[data-state=open]>svg]:rotate-180">
              {item.trigger}
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="px-4 pb-4 pt-0">
              {item.content}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};

export default Accordion;
