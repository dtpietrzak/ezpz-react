import { MantineTheme, Progress, Accordion } from '@mantine/core';

// mantine theme object
export const theme: Partial<MantineTheme> = {
  respectReducedMotion: false,
  components: {
    Progress: Progress.extend({
      styles: {
        root: {
          border: '1px solid rgb(150,150,150)',
          borderRadius: '0.5rem',
          marginBottom: '0.25rem',
        },
      }
    }),
    Accordion: Accordion.extend({
      classNames: {
        item: 'border border-solid border-zinc-300 bg-zinc-100 rounded-lg -mb-2 border-b-0',
        control: 'flex justify-between w-full h-14 px-4 py-2 rounded-lg cursor-pointer',
      }
    })
  }
}

export default theme;