# Setup guide — Stroop study registration site

This is a Google Apps Script project: one script, bound to one Google Sheet,
that serves the web pages, stores registrations, and sends emails
(confirmation + day-before reminder). No separate hosting needed.

All the code is already written, in `apps-script/`. You just need to copy it
into a real Google Apps Script project once. Takes about 10 minutes.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) (log in with whichever
   Google account you want to own this — personal or university).
2. Create a new blank spreadsheet. Name it e.g. "Stroop study — registrations".

## 2. Open the Apps Script editor

1. In the Sheet, go to **Extensions → Apps Script**.
2. A new tab opens with a default `Code.gs` file — delete its contents.

## 3. Copy in the project files

For each file below, create a matching file in the Apps Script editor
(**File → New → Script** for `.gs`, **File → New → HTML** for `.html`),
name it exactly as shown (no extension needed when naming), and paste in
the contents from this project:

| Apps Script file name | Source file |
|---|---|
| `Code` | [apps-script/Code.gs](apps-script/Code.gs) |
| `Landing` | [apps-script/Landing.html](apps-script/Landing.html) |
| `Register` | [apps-script/Register.html](apps-script/Register.html) |
| `Confirm` | [apps-script/Confirm.html](apps-script/Confirm.html) |
| `Stylesheet` | [apps-script/Stylesheet.html](apps-script/Stylesheet.html) |

You can also open **Project Settings** in the editor and set the manifest
to match [apps-script/appsscript.json](apps-script/appsscript.json), though
the defaults are close enough.

## 4. Initialize the Sheet tabs

1. Back in `Code.gs`, use the function dropdown at the top (next to "Debug")
   and select **setupSheets**.
2. Click **Run**. The first time, Google will ask you to authorize the
   script — accept (it's your own script, acting on your own Sheet/Gmail).
3. Check the Sheet: you should now have three tabs — `Registrations`,
   `Slots` (pre-filled with placeholder Tue/Thu slots for the next couple
   weeks), and `Config`.
4. Reload the Sheet tab in your browser once. You should now see a new
   **"Étude Stroop"** menu next to Help in the Sheet's menu bar — that's an
   admin menu built into the code (see step 7) so you don't need to come
   back to this script editor for routine changes.

## 5. Turn on the daily reminder

1. Still in the function dropdown, select **createDailyTrigger** and click
   **Run**. (Or, after step 4, just use the **Étude Stroop → 2. Activer les
   rappels quotidiens** menu item instead.)
2. This schedules `sendDailyReminders` to run automatically every day
   around 8am — it checks for slots happening tomorrow, emails those
   participants a "confirm you're still coming" reminder, and emails the
   subscribed experimenters (Config tab) a one-line digest of who's coming.
3. You can double check it under the **Triggers** icon (clock icon) on the
   left sidebar of the Apps Script editor.

## 6. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, authorize again if asked.
5. Copy the **Web app URL** it gives you — that's your live registration
   site. Send it to me and I'll generate a printable QR code pointing to it.

Any time you edit the code, you need to **Deploy → Manage deployments →
edit (pencil) → New version** for changes to go live at the same URL.

## 7. Day-to-day controls (no code needed)

**Who gets notified of a new registration?**
Open the **Config** tab in the Sheet:
- **Cell B1**: `TRUE` or `FALSE` — the master on/off switch for experimenter
  notifications (new-registration alerts *and* the daily digest below). Flip
  it to `FALSE` for any period you're not running sessions — no code, no
  redeploying, just edit the cell.
- **Column B, from row 4 down**: one experimenter email address per row —
  everyone listed here gets notified when the switch is `TRUE`. Add or
  remove rows freely.

**Is confirmation + reminder actually wired up?**
Yes, both are live once you've done steps 4–5 above:
- **Confirmation email** → sent to the participant the instant they submit
  the form (immediate, not scheduled).
- **Participant reminder** → sent automatically the day before their slot,
  asking them to confirm attendance via a link (handled by the daily
  trigger from step 5).
- **Experimenter digest** → also sent by that same daily trigger: one email
  to everyone in the Config list, listing who's coming tomorrow (name,
  email, slot, affiliation) — or saying nobody's booked, so you know your
  next day's schedule without opening the Sheet.

**How do I choose/add time slots?**
Open the **Slots** tab — one row per bookable slot: `SlotID`, `DateTime`,
`Capacity` (normally `1`, since it's a single E-Prime setup). To add a new
slot, just add a row with the `DateTime` and `Capacity` filled in and
`SlotID` **left blank**, then use the **Étude Stroop → "Générer les ID des
nouveaux créneaux"** menu item in the Sheet — it fills in an ID for any row
missing one. To remove a slot, delete its row (existing registrations for
it are unaffected).

**Testing the emails without waiting for tomorrow:**
Use **Étude Stroop → "Envoyer le récap/rappel de demain maintenant"** in
the Sheet menu — it runs the exact same daily check on demand.

Open the **Registrations** tab any time to see who's signed up, for which
slot, whether their reminder was sent, and whether they clicked "I'll be
there."

## 8. Swap in the real content

Right now `Landing.html` and `Register.html` use placeholder text in
brackets, e.g. `[Titre de l'étude — à remplacer]`. Edit those directly in
the Apps Script editor (or tell me the real copy and I'll update the local
files here for you to re-paste), then redeploy a new version (step 6, last
paragraph).

## 9. QR code for the poster / classroom

Once you've deployed (step 6) and have the real **Web app URL**, send it to
me and I'll generate a QR code image pointing straight to the landing page
— ready to drop into a slide or print on a poster. I can't generate a
working one before that, since a QR code just encodes that URL, and it
doesn't exist until you deploy.

## Known limits worth knowing

- Reminder emails send from the personal Gmail quota of whichever account
  deployed the script (100 emails/day on a free Gmail account) — plenty for
  a single study, but worth knowing if volume grows.
- The "I'll be there" reminder link only marks attendance as confirmed in
  the Sheet — it's not a two-way reschedule system, matching what you asked
  for.
- Anyone with the web app URL can view the registration form. Nothing
  sensitive is exposed on the page itself (slot list only shows date/time
  and remaining spots).
