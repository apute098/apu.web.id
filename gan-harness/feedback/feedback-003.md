# Evaluation — Iteration 3

## Scores

| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Design Quality | 7/10 | 0.35 | 2.45 |
| Originality | 7/10 | 0.30 | 2.10 |
| Craft | 6/10 | 0.25 | 1.50 |
| Functionality | 5/10 | 0.10 | 0.50 |
| **TOTAL** | | | **6.55/10** |

## Verdict: REVISE (threshold: 7.5)

## Critical Issues (must fix)

1. **System status API is dead (404) — hero "proof of life" is a lie.** The API returns "Cannot GET /api/v1/system-status". The code fetches it and gracefully falls back, but in offline mode every metric shows "—" (dashes). The hero tagline says "Setiap angka di panel ini dibaca langsung dari mesin saya — bukan demo" but the panel shows zero real data. Either (a) fix the API endpoint, or (b) if the API genuinely cannot be restored, remove the "bukan demo" claim and replace with honest static descriptions that still carry identity.

2. **Mobile hero is stacked into two flat sections — no recomposition.** At 390px the hero collapses into: text block, then fastfetch panel below. The fastfetch panel shrinks to nearly useless on mobile. Spec requires "responsive 390px truly recomposed, bukan sekadar collapse kolom." Fix: at 390px, merge identity and terminal into a single vertical readout like neofetch output. Stack: `$ whoami` -> name -> tagline -> inline single-column fastfetch readout (no color swatches, just key:value pairs).

## Major Issues (should fix)

1. **Fastfetch panel is severely degraded when API is down.** On desktop it looks good with Arch ASCII art, but the color block strip at the bottom is pure decoration. When data is "—", the entire panel feels hollow. When offline, collapse to a compact 2-line fallback ("server offline — using cached data") instead of showing 9 rows of dashes.

2. **Footer color blocks are meaningless.** The 5 small colored rectangles at the bottom of the fastfetch panel (cyan, orange, green, white, gray) serve no purpose. They exist as visual filler — "AI-slop decoration." Remove them. If you want terminal color blocks, display them only when real data is loaded.

3. **Experience section is the weakest visual section.** The journalctl-style entries are fine conceptually but visually it is just a plain list with thin borders. For 4 entries of different character (restaurant work vs homelab engineering), the visual treatment is identical. The "Homelab Engineer" entry should visually pop — maybe with an active indicator, a different background, or positioned above the separator line.

4. **Service map section is NOT in the spec.** The rubric requires exactly 6 sections: Hero, About+skills, Projects (3), Experience (4), Contact, Footer. The service map section (458-498) is an extra section that dilutes the page. Fold the service status indicators into the fastfetch panel or the projects section.

## Minor Issues (nice to fix)

1. **No GSAP animations used.** The spec says "GSAP tersedia" but all animation is CSS-only (apu-in classes). Add at least one orchestrated GSAP moment — e.g., the fastfetch panel data typing in sequentially, or the project list items staggering in on scroll.

2. **Color weight distribution is imbalanced.** Cyan appears ~30 times across all sections as a primary color. Orange appears only as the `$` prompt prefix. The spec says "accent cyan + orange" but orange is barely present. Give orange a structural role — e.g., active navigation item, or the status indicator dot, or a highlight on the experience "aktif" entry.

3. **No hover state on the service map unit list.** The service entries have `hover:bg-white/[0.03]` but the service map items (475-495) have no hover state at all. Add consistent interaction feedback.

4. **Boot sequence timing could be tighter.** The boot animation has multiple staggered delays (350ms + 260ms per line + 650ms final). Total can reach ~2.5s. Consider 200ms per line and 400ms final — still feels like a boot but doesn't test patience.

5. **Fastfetch ASCII art is only visible on `sm:` breakpoint.** The ARCH_LOGO has `hidden sm:block` which means on mobile it disappears entirely. The Arch logo is the most distinctive visual element — on mobile, consider a compressed 1-line version like `[arch]` or a minimal icon instead of hiding it completely.

## What Improved Since Last Iteration

- Boot sequence animation is well-implemented with skip capability and prefers-reduced-motion support
- Fastfetch panel concept is genuinely strong — it reads like real terminal output
- Accessibility: focus-visible rings, aria-labels, aria-hidden decorative elements all present
- No horizontal scroll confirmed (overflow-x-hidden)
- Clean mono typography throughout creates consistent terminal feel
- Contact section cards are well-structured with 2x2 grid

## What Regressed Since Last Iteration

- N/A (first evaluation of this iteration)

## Specific Suggestions for Next Iteration

1. **Fix or remove the API dependency.** Either get `/api/v1/system-status` working (check `app/api/v1/` route handler), or rework the hero to not depend on live data. The "bukan demo" tagline is the core promise — it must be deliverable.

2. **Recompose the mobile hero as a single-column neofetch readout.** Think: `$ whoami` at top, name below, one-liner tagline, then a compact `neofetch`-style output: `[os] Arch Linux x86_64`, `[cpu] Intel i3-7100 (4c)`, etc. No panels, no cards — just text flowing vertically with terminal flavor.

3. **Remove the service map section.** It's not in the spec and it duplicates information that belongs in the fastfetch panel. Use that screen real estate to give Experience section more breathing room or add a visual distinction between work history entries.

4. **Add one GSAP orchestration.** Simplest high-impact: stagger the fastfetch key:value pairs to appear one by one after boot completes, each with a slight opacity + translateX slide from the left. 30ms stagger. This turns a static data dump into a "booting" moment.

5. **Give orange (#f97316) a structural role.** Currently it's only the `$` prompt prefix. Use it for: the active nav item underline, the experience "aktif" period badge, or the contact email hover state. Orange should feel like a warning/alert accent, not just a dollar sign.
