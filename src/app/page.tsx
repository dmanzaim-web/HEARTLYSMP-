@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: #0b0d0f;
  color: #f6f7fb;
  font-family: Arial, Helvetica, sans-serif;
}

body {
  background:
    radial-gradient(circle at top, rgba(249, 115, 22, 0.2), transparent 30%),
    #0b0d0f;
}

* {
  box-sizing: border-box;
}

button,
input,
select {
  font: inherit;
}

.card { 
  @apply rounded-2xl border border-border bg-panel/90 shadow-glow;
}

.btn-primary {
  @apply inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-600;
}

.btn-secondary {
  @apply inline-flex items-center justify-center rounded-xl border border-border bg-slate-900 px-4 py-2.5 text-slate-100 transition hover:border-accent hover:text-accent;
}

.input {
  @apply w-full rounded-xl border border-border bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-accent;
}
