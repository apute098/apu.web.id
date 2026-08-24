# Evaluation — Iteration 4

## Scores

| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Design Quality | 7.5/10 | 0.35 | 2.63 |
| Originality | 7.5/10 | 0.30 | 2.25 |
| Craft | 7/10 | 0.25 | 1.75 |
| Functionality | 8/10 | 0.10 | 0.80 |
| **TOTAL** | | | **7.43/10** |

## Verdict: REVISE (threshold: 7.5)

## Critical Issues (must fix)

1. **No GSAP animations — spec requires "one orchestrated moment."** The fastfetch data rows appear instantly with CSS `apu-in` classes. The spec says GSAP tersedia and the rubric requires "motion punya satu momen orkestrasi." Add staggered reveal on the fastfetch specRows (30ms stagger, opacity + translateX) so data feels like it's booting in, not just appearing. This is the single highest-impact fix — it turns a static panel into a signature moment.

## Major Issues (should fix)

2. **Color blocks still present in fastfetch panel (lines 363-367).** The 5 small colored rectangles (cyan, orange, green, white, gray) at the bottom of the fastfetch panel are "AI-slop decoration" flagged in iter3. Remove them entirely. The panel is strong without them — the data rows carry the design.

3. **Mobile fastfetch readout shows "—" for all dynamic fields.** On mobile (390px), the inline specRows show: `os: Arch Linux x86_64`, `kernel: linux-zen`, but `uptime: —`, `ram: —`, `disk: —`, etc. The API returns data but the mobile readout isn't receiving it. Verify that `specRows` state updates propagate to the mobile `<dl>` block — check if it's a timing issue where mobile renders before fetch completes.

## Minor Issues (nice to fix)

4. **Orange still underutilized.** Orange (#f97316) appears only as `$` prompt prefixes and the footer `.web.id` accent. The spec says "accent cyan + orange" but orange has no structural role. Give it one: the experience "aktif" period badge, or the nav active state, or the contact card hover border.

5. **Boot sequence timing could be tighter.** Current timing: 350ms first line + 260ms per subsequent + 650ms final = ~2.5s for 6 lines. Consider 200ms per line + 400ms final. The hardCap at 2500ms already handles worst case, but the perceived boot would feel snappier.

6. **Experience section still visually uniform.** The "aktif" entry has cyan left border + gradient, which is good. But the 3 past entries (restaurant work) are visually identical to each other. Consider subtle differentiation — slightly dimmer text, or a separator between work history and homelab.

## What Improved Since Last Iteration

- **API returns real data.** Uptime 5d 17h 43m, CPU 20.6%, RAM 51%, HDD 55.8% — all populated correctly. The "bukan demo" tagline now delivers.
- **Mobile hero recomposed.** At 390px, spec rows are inline below the tagline as a single neofetch-style readout, not a separate collapsed panel. This is proper recomposition.
- **Service map section removed.** No extra section diluting the page — clean 6-section structure.
- **"aktif" experience entry highlighted.** Cyan left border + gradient background distinguishes the homelab entry from past work.
- **Fastfetch panel header shows "● live" status.** Real online/offline indicator with proper color coding.
- **Boot overlay works well.** Click/key/scroll to skip, prefers-reduced-motion respected, hardCap at 2500ms.

## What Regressed Since Last Iteration

- N/A (first evaluation of this iteration)

## Specific Suggestions for Next Iteration

1. **Add one GSAP orchestration.** Stagger the fastfetch specRows to appear sequentially after boot completes — each row fades in with a slight translateX slide from left. 30ms stagger between rows. This is the single fix most likely to push the score over 7.5.

2. **Remove color blocks.** Delete lines 363-367 (the `flex gap-1 mt-2` div with 5 colored `<i>` elements). The panel is stronger without them.

3. **Fix mobile data propagation.** Check if `specRows` depends on `sys` state which may not be populated when mobile renders. If the fetch completes after initial render, the mobile readout should update — verify React re-render triggers the mobile `<dl>` update.

4. **Give orange one structural role.** Simplest: change the experience "aktif" badge color from cyan to orange, or add an orange dot to the nav active item. This rebalances the color weight without redesigning anything.
