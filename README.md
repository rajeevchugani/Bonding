# Bonding Lab

Interactive IGCSE Chemistry revision for ionic, covalent and metallic bonding. The look matches the Science Revision Hub (dark navy, Chemistry pink, lime and cyan highlights). Use the Light mode / Dark mode button in the header to switch; the choice is remembered on that device.

**Fonts (Google Fonts, loaded from the internet):** Bricolage Grotesque 800 for headings, DM Sans 400/500/700 for body text, DM Mono for labels and numbers. Without internet the browser uses its default fonts.

## How to open it
Double-click `index.html`. It opens in any modern browser (Chrome, Edge, Safari, Firefox) and needs no install. It works best with an internet connection for the page fonts, but is usable without one. Student progress is saved on the device they use, so it is not shared between computers.

To put it on a school site or learning platform, upload `index.html` as a single file.

---

## Student introduction (copy and paste)

**Welcome to Bonding Lab!**

Bonding Lab is a place to practise ionic, covalent and metallic bonding, including dot-and-cross diagrams. You cannot break anything, so have a go and learn from your mistakes.

**How to find things:** the four big buttons at the top group everything. **Practise** (Bonding practice, Read the diagram, Sort the substances), **Build and explore** (Electron lab, Electron arrangements, Ion formulae), **Structures** (Giant structures, Molecule shapes, Alloys, Bulb test) and **Test and revise** (Test yourself, Revision sheet).

**How to use it**
1. **Start with Bonding practice.** Pick a substance, decide if it is ionic, covalent or metallic, then complete the dot-and-cross diagram. Choose *Guided* if you want step-by-step help, or a harder mode with more blanks when you feel confident.
2. **Try the Electron lab.** Drag the electrons yourself to see them transfer (ionic), share (covalent) or delocalise (metallic). Choose a level: *Guided*, *A little help*, *Unguided* or *Free play* (no questions and no marking, move electrons, see the charges change, and type in the charge on each ion to check it). You can also tick or untick "Answer questions before moving the electrons". In the last two you work out the numbers first: how many outer electrons each atom has and how many must move.
   Then try **Read the diagram** (work backwards from a finished diagram to the formula, name and charges), **Sort the substances** (ionic, simple covalent, giant covalent or metallic) and **Electron arrangements** (build 2,8,1 style arrangements, then make the ion).
3. **Explore the structures.** *Giant structures* and *Molecule shapes* have 3D models you can turn. *Alloys* shows why mixing metals changes their properties. *Bulb test* is a quick look at why some substances let the bulb light.
4. **Learn the formulae.** *Ion formulae* shows how to build formulae from simple ions in Groups 5, 6 and 7, such as magnesium nitride and calcium chloride.
5. **Test yourself.** Use *Quick quiz* for fast questions, or the *Written paper* for a timed exam-style set with a mark scheme.
6. **Revise.** The *Revision sheet* can be printed. The *Periodic table* button (bottom right) floats over any page when you need it.

**Tips**
- In a dot-and-cross diagram, dots and crosses just show which atom the electrons came from. They do not have to be in the same place as in the answer.
- Use the *Show me how it forms* walkthrough and *Common mistakes* boxes if you get stuck.
- Your progress is saved on this device. Use *Focus on my weak topics* to practise what you find hardest.

---

## Teacher notes

- **Whole-class quiz:** *Test yourself > Quick quiz* has options for a timed round, a big-screen display and weak-topic focus.
- **Written paper:** choose the number of questions, time allowed and bonding types. *Print a paper and mark scheme* makes a paper and answer key to hand out.
- **Revision sheet:** one version with answers (for you) and one with blanks (for students), both printable.
- **Content level:** simple ions only. Positive: Li, Na, K, Ag, Mg, Ca, Ba, Zn, Cu(II), Fe(II), Al, Fe(III). Negative: Group 7 (F, Cl, Br, I), Group 6 (O, S) and Group 5 (N, P). No polyatomic ions.
- **Practice substances:** NaCl, MgO, MgCl₂, CaCl₂, Na₂O, K₂O, KBr, LiF, CaO, Al₂O₃; H₂, Cl₂, O₂, N₂, F₂, HCl, HF, H₂O, NH₃, CH₄, CO₂, CCl₄, ethene; Li, Na, K, Mg, Ca, Al metals.
- **Colours in diagrams:** pink crosses and cyan dots show which atom the electrons came from. Right answers are green with a tick and wrong answers are orange with a cross, so they never rely on colour alone.
- **Progress** is stored in the browser of each device (local storage). Clearing browser data resets it.

- **Hub link:** the "← Science Revision Hub" link at the top of the page opens your hub in a new tab. To change the address, edit the `href` of the link with `id="hublink"` in `index.html` (and in `source/p1.html`).

## What is in this folder
- `index.html`: the complete website (one file).
- `source/`: the separate source parts the site is built from (`p1.html` page and styles, `p2.js` to `p16.js` scripts). Joining `p1.html`, then `<script>`, then `p2.js` to `p16.js` in order, then `</script>` rebuilds `index.html`.
