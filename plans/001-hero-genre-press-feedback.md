# 001 — Add pointer press feedback to hero genre buttons

- **Status**: TODO
- **Commit**: e7e43f0
- **Severity**: LOW
- **Category**: Missed opportunities / feedback
- **Estimated scope**: 2 source files, roughly 40 changed lines

## Problem

Repository: `X:/GitHub/wopian/wopian.moe`.

Genre buttons change selection on click but have no pointer press feedback. Expected frequency: tens of activations per visit. Keep feedback subtle. Keyboard activation must remain immediate and motion-free for button feedback.

`X:/GitHub/wopian/wopian.moe/app/components/PortfolioHero.vue:4-5` currently contains:

```ts
const selected = ref(0)
const current = computed(() => showcases[selected.value]!)
```

`X:/GitHub/wopian/wopian.moe/app/components/PortfolioHero.vue:16` currently contains:

```vue
      <div class="genre-controls" role="group" aria-label="Select featured photography genre"><button v-for="(showcase, index) in showcases" :key="showcase.genre" type="button" :aria-pressed="selected === index" @click="selected = index"><span>{{ showcase.label }}</span><span class="genre-indicator" aria-hidden="true" /></button></div>
```

`X:/GitHub/wopian/wopian.moe/app/assets/css/main.css:89` currently contains:

```css
.genre-controls button { display: flex; align-items: center; gap: 10px; background: none; color: #c0b8c3; font-size: 13px; padding-block: 8px; transition: color 250ms; }
```

Global reduced-motion rule at `app/assets/css/main.css:283-285` overrides all transition durations:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```

## Target

Pointer press scales only pressed button to `scale(.98)` in **160ms**. Release returns to `scale(1)` in **100ms**. Both use `cubic-bezier(0.23, 1, 0.32, 1)`.

This refines initial opportunity recipe: asymmetric timing follows audit guidance. Slower press gives resistance; faster release resets feedback promptly.

Reduced motion replaces scaling with opacity `1` to `.85`, using same 160ms press and 100ms release. Keyboard-only interaction never applies press state. Existing selection colors, indicator, photo crossfade, and click timing remain unchanged.

## Repo conventions to follow

- Nuxt 4 / Vue 3 script setup, auto-imported `ref` and `computed`.
- Native buttons retain `type="button"`, `aria-pressed`, and existing click handler.
- Motion styles live in `app/assets/css/main.css`.
- Existing `.genre-indicator` uses reversible CSS transitions. Use transitions, never keyframes or timers.
- Existing custom properties use narrow names such as `--portfolio-accent`. Scope new `--genre-press-ease` to `.genre-controls`; do not override Tailwind/Nuxt UI `--ease-out` globally.
- No extra motion library required. No hover behavior added, so no hover media query required. Touch and mouse both receive press feedback.

## Steps

1. In `app/components/PortfolioHero.vue`, add beside `selected`:

   ```ts
   const pressed = ref<number | null>(null)
   function startPress(index: number, event: PointerEvent) {
     if (!event.isPrimary || event.button !== 0) return
     pressed.value = index
   }
   function endPress(index: number) {
     if (pressed.value === index) pressed.value = null
   }
   ```

2. Format existing genre controls across lines. Add bindings to each existing button:

   ```vue
   :data-pointer-pressed="pressed === index ? 'true' : undefined"
   @pointerdown="startPress(index, $event)"
   @pointerup="endPress(index)"
   @pointercancel="endPress(index)"
   @pointerleave="endPress(index)"
   @blur="endPress(index)"
   @keydown="pressed = null"
   ```

   Retain existing attributes, content, and `@click="selected = index"` exactly. Never call `preventDefault`, capture pointers, move selection into pointer handlers, or replace native keyboard behavior. Pointer handlers affect visual state only. Vue owns state lifetime; no global listeners needed.

3. In `app/assets/css/main.css`, add after `.genre-controls` and extend existing button rule. Keep every current declaration; replace only its `transition` declaration:

   ```css
   .genre-controls { --genre-press-ease: cubic-bezier(0.23, 1, 0.32, 1); }
   .genre-controls button {
     transform: scale(1);
     transition: color 250ms, transform 100ms var(--genre-press-ease);
   }
   .genre-controls button[data-pointer-pressed="true"] {
     transform: scale(.98);
     transition-duration: 250ms, 160ms;
   }
   ```

   Merge declarations into existing rules where appropriate. Default transform origin remains center. Avoid global button selectors and `:active`, which also matches keyboard presses.

4. Append these scoped rules inside existing reduced-motion media query, after universal override:

   ```css
   .genre-controls button {
     transform: none;
     opacity: 1;
     transition-property: opacity;
     transition-duration: 100ms !important;
     transition-timing-function: var(--genre-press-ease);
   }
   .genre-controls button[data-pointer-pressed="true"] {
     transform: none;
     opacity: .85;
     transition-duration: 160ms !important;
   }
   ```

   Scoped specificity and `!important` restore only this opacity feedback. Leave global override intact for all other elements.

## Boundaries

- Edit only `app/components/PortfolioHero.vue` and `app/assets/css/main.css` during execution.
- Do not change hero geometry, button hit areas, genre order, text, selected state behavior, focus outlines, or image transitions.
- Do not animate layout, add hover motion, introduce dependencies, timers, keyframes, or permanent `will-change`.
- Do not change global easing tokens or global reduced-motion policy.
- No unrelated fixes, commits, push, or deployment.
- If cited code differs materially from commit stamp, stop and report drift before changing scope.

## Verification

- **Mechanical**: From repository root, run `bun run typecheck` and `bun test`. Expect exit code 0. Review `git diff --check`; expect no whitespace errors. Do not add tests that merely duplicate CSS declarations.
- **Dev browser check**: Run `bun run dev`. Open homepage in available Chrome and Edge browsers. Record browser versions and any unavailable browser separately.
- **Production browser check**: Run `bun run build`, then `bun run preview`. Repeat interaction checks against generated static app. Build must pass existing static verification.
- **Pointer feel check**:
  - Hold each genre button. Only held button scales, centered, without changing layout.
  - Selection changes on click, never on pointerdown alone.
  - Release, drag pointer outside, cancel touch, or blur button. Feedback returns immediately through release transition; no stuck state.
  - Rapid repeated presses retarget from current scale without snapping or waiting.
  - Secondary mouse button and non-primary pointers do not start feedback.
  - At 10% playback in DevTools Animations panel, inspect 160ms press and 100ms release using specified curve.
- **Keyboard check**: Tab through buttons; activate with Space and Enter. Native focus outline and selection work. No scale or opacity press animation occurs. Existing selection indicator and photo transitions remain unchanged.
- **Reduced-motion check**: Enable `prefers-reduced-motion: reduce` in browser. Pointer press changes only opacity, `.85` while held and `1` on release. Computed durations are 160ms and 100ms despite universal override. Toggle preference during held press; no persistent transform remains.
- **Touch check**: Use real phone for tap, long press, scroll cancellation, and rapid taps. Verify no stuck feedback or blocked scrolling. Emulation alone does not establish real-device feel.
- **Done when**: Checks confirm scoped, interruptible pointer feedback; keyboard behavior and hero layout remain unchanged. Record checks actually performed. Mark unavailable real-device or browser checks unverified, not passed.
