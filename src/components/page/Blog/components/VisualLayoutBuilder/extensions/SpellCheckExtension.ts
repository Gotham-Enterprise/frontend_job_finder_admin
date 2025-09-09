import { Extension } from '@tiptap/core';

export interface SpellCheckOptions {
  enabled: boolean;
  language: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spellCheck: {
      toggleSpellCheck: () => ReturnType;
    };
  }
}

export const SpellCheckExtension = Extension.create<SpellCheckOptions>({
  name: 'spellCheck',

  addOptions() {
    return {
      enabled: true,
      language: 'en-US',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          spellcheck: {
            default: this.options.enabled,
            parseHTML: element => element.getAttribute('spellcheck'),
            renderHTML: attributes => {
              if (!attributes.spellcheck) {
                return {};
              }
              return {
                spellcheck: attributes.spellcheck,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      toggleSpellCheck:
        () =>
        ({ commands }) => {
          this.options.enabled = !this.options.enabled;
          return commands.updateAttributes('textStyle', {
            spellcheck: this.options.enabled,
          });
        },
    };
  },

  onCreate() {
    if (this.options.enabled && this.editor.view.dom) {
      this.editor.view.dom.setAttribute('spellcheck', 'true');
      this.editor.view.dom.setAttribute('lang', this.options.language);
    }
  },
});

export default SpellCheckExtension;
