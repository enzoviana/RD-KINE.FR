<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Site architecture
- Use shared site chrome in the root and separate leaf routes for all major content sections, so navigation and metadata remain consistent.
- Keep supplied cabinet facts in a browser-safe data module and cover access conditions and travel times with focused tests, so displayed details stay consistent.
- Use illustrative bundled photography without claiming it depicts the actual cabinet or team; replace it when authentic assets are supplied.

## Espace patient / administration
- Account areas live under the managed `_authenticated` gate; bookings go through security-definer SQL functions so patients can only claim free slots or cancel their own.
- Roles are stored in `user_roles` (first account becomes admin via signup trigger); never infer admin from profile data.
- Admin navigation uses nested leaf routes under the existing admin gate and a shared workspace module, so each section has a URL while retaining current data permissions.
- Account chrome uses a viewport-height flex frame with an independently scrolling body and compact footer, so tab changes cannot move the footer or obscure content.
- The dedicated public admin sign-in page reuses managed account authentication and the existing role check; it offers no role assignment or signup, so separate entry points do not grant extra permissions.
- Temporary-password accounts are blocked by the database role-check function until the Auth password fingerprint changes; the admin shell shows the mandatory password form, so bypassing the page does not unlock administrator data.
- Admin and practitioner workspaces run on a single demo data module scoped by practitioner, rendered without site header/footer, so the presentation stays consistent until real data is connected.
