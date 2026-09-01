// Demo data for StoryRoom — seeded into localStorage on first load.
// One realistic project so the app looks complete immediately.

export function makeDemoProject() {
  return {
    id: 'proj-last-frame',
    title: 'THE LAST FRAME',
    logline:
      'A young filmmaker discovers that the disappearance of her brother is connected to a film he was secretly making.',
    genre: 'Psychological Thriller',
    tone: 'Restrained, observational, quietly unsettling',
    directorIntent:
      'Tell this as a story about looking — at footage, at people, at what we avoid seeing in ourselves. Riya should investigate the way she edits: patiently, rewinding, refusing to look away. The film trusts the audience to read silence.',

    characters: [
      {
        id: 'char-riya',
        name: 'Riya Mehta',
        age: 27,
        role: 'Protagonist',
        description:
          'An assistant editor at a small post-production house in Mumbai. Precise, watchful, more comfortable behind a timeline than in a conversation.',
        personality: 'Emotionally restrained, observant, avoids openly discussing grief.',
        relationships: 'Younger sister of Arjun Mehta. Old friend of Kabir Shah from film school.',
        emotionalArc:
          'Moves from controlled denial to a compulsive, obsessive need to see the footage through to its end — even when it costs her the people still in her life.',
      },
      {
        id: 'char-arjun',
        name: 'Arjun Mehta',
        age: 31,
        role: 'Missing brother',
        description:
          'An independent filmmaker who vanished eight months ago during production of an unfinished, unnamed project. Seen only in footage.',
        personality: 'Obsessive and secretive, brilliant but withdrawn in his final months.',
        relationships: 'Older brother of Riya. Once collaborated with Kabir on a short film.',
        emotionalArc:
          'Exists only in fragments — the audience assembles him the way Riya does, one reel at a time.',
      },
      {
        id: 'char-kabir',
        name: 'Kabir Shah',
        age: 29,
        role: "Riya's friend",
        description: 'A documentary cinematographer who shot Arjun\'s earlier work.',
        personality: 'Practical and skeptical, worried about Riya more than the mystery itself.',
        relationships: 'Former collaborator of Arjun. Close friend of Riya, wants to protect her.',
        emotionalArc:
          'Starts as a voice of reason trying to pull Riya back to safety, ends up pulled into the same obsession himself.',
      },
    ],

    locations: [
      {
        id: 'loc-cafe',
        name: 'Cafe',
        description: 'Corner table at a noisy Irani cafe where Riya and Kabir meet away from campus.',
      },
      {
        id: 'loc-riya-apt',
        name: "Riya's Apartment",
        description: 'Small, cluttered with editing monitors, sound baffles, and labeled MiniDV tape boxes.',
      },
      {
        id: 'loc-arjun-apt',
        name: "Arjun's Apartment",
        description: 'Sealed top-floor flat with packed archive boxes, books on cinematography, and cold morning light.',
      },
      {
        id: 'loc-studio',
        name: 'Editing Studio',
        description: 'Rented room above a print shop with flatbed 16mm film viewers and untouched work reels.',
      },
      {
        id: 'loc-station',
        name: 'Railway Station',
        description: 'Suburban transit platform and abandoned freight yard where Arjun shot his last sequence.',
      },
    ],

    scenes: [
      {
        id: 'scene-1',
        number: 1,
        title: 'The Tapes',
        location: "Riya's Apartment",
        timeOfDay: 'NIGHT',
        characters: ['char-riya'],
        summary:
          "Riya logs through Arjun's old MiniDV tapes for an editing job she's using as an excuse to look. She notices a timestamp that doesn't match the box label.",
        emotionalGoal: "Establish Riya's controlled grief through procedure, not speech.",
        continuityNotes: "Tapes are labeled by hand in March; timestamp on tape 14 reads a date after Arjun's disappearance.",
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `INT. RIYA'S APARTMENT - NIGHT\n\nA cramped room. Two monitors glow blue against stacked boxes of MiniDV tapes, each labeled in Arjun's handwriting.\n\nRIYA MEHTA (27), sits cross-legged on the floor, headphones on, logging timecodes into a notebook. She works fast, mechanical.\n\nShe loads TAPE 14. Static, then a hallway. She freezes on a frame, checks the label against the on-screen timestamp.\n\nThe label says MARCH 3. The timecode on screen reads JUNE 19. Three months after he vanished.\n\nShe doesn't react visibly. Just rewinds three seconds. Plays it again.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
        screenplay: `INT. RIYA'S APARTMENT - NIGHT

A cramped room. Two monitors glow blue against stacked boxes of MiniDV tapes, each labeled in Arjun's handwriting.

RIYA MEHTA (27), sits cross-legged on the floor, headphones on, logging timecodes into a notebook. She works fast, mechanical.

She loads TAPE 14. Static, then a hallway. She freezes on a frame, checks the label against the on-screen timestamp.

The label says MARCH 3. The timecode on screen reads JUNE 19. Three months after he vanished.

She doesn't react visibly. Just rewinds three seconds. Plays it again.`,
      },
      {
        id: 'scene-2',
        number: 2,
        title: 'The Cafe',
        location: 'Cafe',
        timeOfDay: 'DAY',
        characters: ['char-riya', 'char-kabir'],
        summary:
          'Riya meets Kabir at an Irani cafe to ask about the camera package Arjun rented. Kabir tries to warn her off.',
        emotionalGoal: 'Surface the tension between wanting help and refusing to admit she needs it.',
        continuityNotes: "First mention of the unnamed project. Kabir's skepticism established here, should track through scene 5-6.",
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `INT. CAFE - DAY\n\nNoisy tables. Steam hisses from the espresso machine. RIYA waits at a corner booth. KABIR SHAH (29), camera bag over one shoulder, spots her and slides into the booth.\n\nKABIR\nYou hate this place.\n\nRIYA\nI hate being early more.\n\nA beat. He reads her face.\n\nKABIR\nThis isn't about the Ghosh cut.\n\nRIYA\nNo.\n\nKABIR\n(sighing)\nRiya.\n\nRIYA\nHe was shooting something. Before. He never told me what.\n\nKABIR\nHe didn't tell anyone what. That was kind of his thing. Arjun's turning thirty next month, and he still won't tell me what he's working on.\n\nRIYA\nYou worked with him longer than I did.\n\nKABIR\nTwo years ago. On something that had a name.\n\nShe doesn't answer. He studies her, then shifts the bag on his shoulder.\n\nKABIR (CONT'D)\nWhatever's on those tapes, it's not going to bring him back.\n\nRIYA\nI know that.\n\nShe clearly doesn't, not entirely. He lets it go — for now.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
        screenplay: `INT. CAFE - DAY

Noisy tables. Steam hisses from the espresso machine. RIYA waits at a corner booth. KABIR SHAH (29), camera bag over one shoulder, spots her and slides into the booth.

KABIR
You hate this place.

RIYA
I hate being early more.

A beat. He reads her face.

KABIR
This isn't about the Ghosh cut.

RIYA
No.

KABIR
(sighing)
Riya.

RIYA
He was shooting something. Before. He never told me what.

KABIR
He didn't tell anyone what. That was kind of his thing. Arjun's turning thirty next month, and he still won't tell me what he's working on.

RIYA
You worked with him longer than I did.

KABIR
Two years ago. On something that had a name.

She doesn't answer. He studies her, then shifts the bag on his shoulder.

KABIR (CONT'D)
Whatever's on those tapes, it's not going to bring him back.

RIYA
I know that.

She clearly doesn't, not entirely. He lets it go — for now.`,
      },
      {
        id: 'scene-3',
        number: 3,
        title: 'Take Seven',
        location: 'Editing Studio',
        timeOfDay: 'DAY',
        characters: ['char-riya'],
        summary:
          'Riya lets herself into Arjun\'s untouched studio and finds a reel hidden behind a panel, labeled only "TAKE 7."',
        emotionalGoal: 'A quiet discovery scene — dread expressed through space and objects, not dialogue.',
        continuityNotes: 'Reel labeled "TAKE 7" — must remain consistent across scenes 3, 6, 7 (not "Reel 7" or "Take VII").',
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `INT. EDITING STUDIO - DAY\n\nDust on everything. The paper mill studio above a print shop, exactly as he left it. RIYA lets herself in with a key she's never used before.\n\nShe moves down the row of shelves. Flat cans of 16mm film, old Bolex magazines, empty cores.\n\nBehind a loose wall panel near the Steenbeck: ONE CAN, taped shut.\n\nWritten on the white tape in black marker:\n\nTAKE 7 - DO NOT SCREEN\n\nShe holds the can. Weighs it in her hands. The room is dead quiet except for traffic two floors below.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
        screenplay: `INT. EDITING STUDIO - DAY

Dust on everything. The paper mill studio above a print shop, exactly as he left it. RIYA lets herself in with a key she's never used before.

She moves down the row of shelves. Flat cans of 16mm film, old Bolex magazines, empty cores.

Behind a loose wall panel near the Steenbeck: ONE CAN, taped shut.

Written on the white tape in black marker:

TAKE 7 - DO NOT SCREEN

She holds the can. Weighs it in her hands. The room is dead quiet except for traffic two floors below.`,
      },
      {
        id: 'scene-4',
        number: 4,
        title: 'The Report',
        location: "Arjun's Apartment",
        timeOfDay: 'DAY',
        characters: ['char-riya'],
        summary:
          'Riya tries to show the tape 14 timestamp to the police detective handling the missing-person file. He treats it as routine confusion.',
        emotionalGoal: 'Frustration suppressed — Riya realizes institutions have already closed the book.',
        continuityNotes: 'Detective remains unnamed — do not introduce a name unless casting is confirmed.',
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `INT. ARJUN'S APARTMENT - DAY\n\nCold morning light. RIYA sits across a makeshift table from a DETECTIVE (40s), tired, not unkind.\n\nDETECTIVE\nA timestamp on an old tape.\n\nRIYA\nAfter he was reported missing. Recorded after.\n\nDETECTIVE\nCameras misdate all the time. Battery dies, clock resets.\n\nRIYA\nI feel so devastated and heartbroken, I can't believe my brother is gone and it's destroying me inside, and nobody will just look at the tape.\n\nThe Detective sighs, slides a box of tissues two inches closer, says nothing.\n\nDETECTIVE\nI'll flag the file. That's what I can do today.\n\nShe takes the tape back off the desk before he can touch it.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
        screenplay: `INT. ARJUN'S APARTMENT - DAY

Cold morning light. RIYA sits across a makeshift table from a DETECTIVE (40s), tired, not unkind.

DETECTIVE
A timestamp on an old tape.

RIYA
After he was reported missing. Recorded after.

DETECTIVE
Cameras misdate all the time. Battery dies, clock resets.

RIYA
I feel so devastated and heartbroken, I can't believe my brother is gone and it's destroying me inside, and nobody will just look at the tape.

The Detective sighs, slides a box of tissues two inches closer, says nothing.

DETECTIVE
I'll flag the file. That's what I can do today.

She takes the tape back off the desk before he can touch it.`,
      },
      {
        id: 'scene-5',
        number: 5,
        title: 'The Freight Yard',
        location: 'Railway Station',
        timeOfDay: 'DUSK',
        characters: ['char-riya', 'char-kabir'],
        summary:
          'Riya and Kabir trace the background skyline from tape 14 to an abandoned railway siding near Wadala.',
        emotionalGoal: 'Transition from passive reviewing to physical pursuit.',
        continuityNotes: 'Location name must match: Railway Station / freight yard siding (not docks or warehouse).',
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `EXT. RAILWAY STATION - DUSK\n\nA row of shuttered tracks. RIYA and KABIR walk the fence line, her phone held up, comparing a paused frame from tape 14 against the skyline.\n\nKABIR\nThat's the old freight yard. Nobody's touched it in a decade.\n\nRIYA\nIt's in the background. Behind him.\n\nKABIR\nRiya, this isn't a set visit. This is trespassing.\n\nRIYA\nSo don't come in.\n\nShe's already walking toward the gap in the fence. He swears under his breath and follows.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
        screenplay: `EXT. RAILWAY STATION - DUSK

A row of shuttered tracks. RIYA and KABIR walk the fence line, her phone held up, comparing a paused frame from tape 14 against the skyline.

KABIR
That's the old freight yard. Nobody's touched it in a decade.

RIYA
It's in the background. Behind him.

KABIR
Riya, this isn't a set visit. This is trespassing.

RIYA
So don't come in.

She's already walking toward the gap in the fence. He swears under his breath and follows.`,
      },
      {
        id: 'scene-6',
        number: 6,
        title: 'The Set',
        location: 'Editing Studio',
        timeOfDay: 'NIGHT',
        characters: ['char-riya', 'char-kabir'],
        summary:
          'Inside the studio backroom, they find lighting rigs and set dressing matching Arjun\'s unnamed footage.',
        emotionalGoal: 'Confirmation, not resolution — the space itself is the reveal.',
        continuityNotes: 'Must describe the same building as scene 3 (the paper mill studio), not a different structure. Kabir\'s skepticism should visibly crack here.',
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `INT. EDITING STUDIO - NIGHT\n\nTheir flashlights cut through dust. The textile mill floor is bare concrete — except for one corner, where sandbags, a C-stand, and a folding chair sit arranged like nobody ever struck the set.\n\nKABIR\n(quiet)\nThis is lit. Somebody lit this.\n\nRIYA\nRecently.\n\nShe finds a strip of gaffer tape marking a floor position, still tacky at the edge.\n\nKABIR\nOkay. Okay, I believe you now.\n\nIt costs him something to say it. She doesn't gloat. She just keeps looking.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
        screenplay: `INT. EDITING STUDIO - NIGHT

Their flashlights cut through dust. The textile mill floor is bare concrete — except for one corner, where sandbags, a C-stand, and a folding chair sit arranged like nobody ever struck the set.

KABIR
(quiet)
This is lit. Somebody lit this.

RIYA
Recently.

She finds a strip of gaffer tape marking a floor position, still tacky at the edge.

KABIR
Okay. Okay, I believe you now.

It costs him something to say it. She doesn't gloat. She just keeps looking.`,
      },
      {
        id: 'scene-7',
        number: 7,
        title: 'Take Seven, Played',
        location: "Riya's Apartment",
        timeOfDay: 'NIGHT',
        characters: ['char-riya', 'char-arjun'],
        summary:
          'Alone, Riya finally screens the TAKE 7 reel and sees Arjun look directly into the lens, mouthing something she can\'t quite read.',
        emotionalGoal: 'The most restrained scene in the script — everything through the image, nothing spoken.',
        continuityNotes: 'Same reel as scene 3, same label "TAKE 7." Time is later the same night as scene 6.',
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `INT. RIYA'S APARTMENT - NIGHT (LATER)\n\nA borrowed telecine rig hums on the desk. RIYA threads the TAKE 7 reel by hand, careful, practiced.\n\nThe image resolves on her monitor: the studio floor, lit exactly as they found it. ARJUN, seen only from behind at first, walks into frame.\n\nHe turns. Looks directly into the lens — directly at her.\n\nHis mouth moves. No sound on the reel. Two words, maybe three.\n\nRIYA leans in until her face is inches from the screen, mouthing along, trying to match the shape of it.\n\nShe doesn't get it. Not yet.\n\nShe rewinds. Plays it again.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
          {
            version: 2,
            label: 'Version 2 (AI Proposal)',
            type: 'ai_proposal',
            screenplay: `INT. RIYA'S APARTMENT - NIGHT (LATER)\n\nThe room is dark except for the telecine rig's amber glow. RIYA threads the TAKE 7 reel with the practiced care of someone who does not trust herself to breathe wrong.\n\nShe kills the room light. Just the monitor now.\n\nThe image resolves: the studio floor, lit as they found it. ARJUN walks into frame from behind the camera. He moves like someone who knows exactly where the lens is.\n\nHe stops. Turns.\n\nLooks directly into the lens. Into the room where she is sitting.\n\nHis mouth moves. Three words. Maybe two. The reel has no sound.\n\nRIYA leans forward until her reflection overlaps his face on the glass. She mouths the syllables back at herself, trying to match the shape of them.\n\nShe stops.\n\nRewinds.\n\nPlays it again. Frame by frame this time.\n\nHer hand does not move.`,
            timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
            reason: 'Make Scene 7 more tense without making the dialogue dramatic.',
            author: 'AI Agent',
            revisionId: 'rev-scene-7-tense',
          },
        ],
        screenplay: `INT. RIYA'S APARTMENT - NIGHT (LATER)

A borrowed telecine rig hums on the desk. RIYA threads the TAKE 7 reel by hand, careful, practiced.

The image resolves on her monitor: the studio floor, lit exactly as they found it. ARJUN, seen only from behind at first, walks into frame.

He turns. Looks directly into the lens — directly at her.

His mouth moves. No sound on the reel. Two words, maybe three.

RIYA leans in until her face is inches from the screen, mouthing along, trying to match the shape of it.

She doesn't get it. Not yet.

She rewinds. Plays it again.`,
      },
      {
        id: 'scene-8',
        number: 8,
        title: 'Alone, Again',
        location: 'Railway Station',
        timeOfDay: 'DAWN',
        characters: ['char-riya'],
        summary:
          'Against Kabir\'s warning, Riya returns to the station freight line alone at first light.',
        emotionalGoal: 'End on unresolved tension — no dialogue, just Riya crossing a threshold she was told not to cross.',
        continuityNotes: 'Same station as scene 5. Time jumps from "NIGHT (LATER)" in scene 7 to "DAWN" — the following morning, not later the same night.',
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `EXT. RAILWAY STATION - DAWN\n\nGrey light. The fence gap from scene 5, still bent open. RIYA stands at it, phone in hand, KABIR'S last text still on the screen: "Don't go back there without me."\n\nShe puts the phone in her pocket.\n\nSteps through the gap.\n\nThe platform swallows her into shadow.\n\nFADE OUT.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
        screenplay: `EXT. RAILWAY STATION - DAWN

Grey light. The fence gap from scene 5, still bent open. RIYA stands at it, phone in hand, KABIR'S last text still on the screen: "Don't go back there without me."

She puts the phone in her pocket.

Steps through the gap.

The platform swallows her into shadow.

FADE OUT.`,
      },
    ],

    directorsMemory: [
      'Prefer visual storytelling over exposition.',
      'Keep emotional moments restrained.',
      'Avoid melodramatic dialogue.',
      'Characters rarely say exactly what they feel.',
      'Maintain psychological tension.',
      'Avoid unnecessary exposition.',
      'Dialogue should sound natural.',
      'Silence can carry emotional information.',
    ],

    revisions: [
      {
        id: 'rev-scene-7-tense',
        sceneId: 'scene-7',
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        status: 'pending',
        originalText: `INT. RIYA'S APARTMENT - NIGHT (LATER)\n\nA borrowed telecine rig hums on the desk. RIYA threads the TAKE 7 reel by hand, careful, practiced.\n\nThe image resolves on her monitor: the studio floor, lit exactly as they found it. ARJUN, seen only from behind at first, walks into frame.\n\nHe turns. Looks directly into the lens — directly at her.\n\nHis mouth moves. No sound on the reel. Two words, maybe three.\n\nRIYA leans in until her face is inches from the screen, mouthing along, trying to match the shape of it.\n\nShe doesn't get it. Not yet.\n\nShe rewinds. Plays it again.`,
        proposedText: `INT. RIYA'S APARTMENT - NIGHT (LATER)\n\nThe room is dark except for the telecine rig's amber glow. RIYA threads the TAKE 7 reel with the practiced care of someone who does not trust herself to breathe wrong.\n\nShe kills the room light. Just the monitor now.\n\nThe image resolves: the studio floor, lit as they found it. ARJUN walks into frame from behind the camera. He moves like someone who knows exactly where the lens is.\n\nHe stops. Turns.\n\nLooks directly into the lens. Into the room where she is sitting.\n\nHis mouth moves. Three words. Maybe two. The reel has no sound.\n\nRIYA leans forward until her reflection overlaps his face on the glass. She mouths the syllables back at herself, trying to match the shape of them.\n\nShe stops.\n\nRewinds.\n\nPlays it again. Frame by frame this time.\n\nHer hand does not move.`,
        reason: 'Grounded the scene in physical specificity — the darkened room, the amber glow, Riya killing the light to be alone with the image. Riya\'s physical closeness to the monitor is intensified. "Frame by frame" is added to mirror her investigative methodology established in Scene 1. The final still hand replaces the more general "plays it again" to anchor the tension in a physical image rather than continued action.',
        instruction: 'Make Scene 7 more tense without making the dialogue dramatic.',
        directorIntentAlignment: [
          'Prefer visual storytelling over exposition — scene is entirely image and physical behavior.',
          'Silence can carry emotional information — zero dialogue, pure optical subtext.',
          'Keep emotional moments restrained — Riya does not react overtly; her stillness is the reaction.',
          'Maintain psychological tension — ends on an unresolved held breath, not a release.',
        ],
        continuityConsiderations: [
          'Reel labeled "TAKE 7" — matches scenes 3, 6, 7.',
          'Riya working with telecine rig matches her editing background.',
          'Arjun remains seen only in footage, not in person.',
        ],
        potentialRisks: [
          'The "overlapping reflection" detail requires precision in monitor placement and lighting on set.',
        ],
        mode: 'demo',
      },
    ],
    activity: [
      {
        id: 'act-init-5',
        timestamp: new Date(Date.now() - 45 * 1000).toISOString(),
        action: 'Generated revision',
        tool: 'propose_rewrite',
        input: { sceneId: 'scene-7', instruction: 'Make Scene 7 more tense without making the dialogue dramatic.' },
        outputSummary: 'Generated revision proposal for Scene 07 ("Take Seven, Played")',
        status: 'waiting_for_director',
        result: 'WAITING FOR DIRECTOR',
      },
      {
        id: 'act-init-4',
        timestamp: new Date(Date.now() - 47 * 1000).toISOString(),
        action: 'Checked continuity',
        tool: 'check_continuity',
        input: { sceneId: 'scene-7' },
        outputSummary: 'Checked continuity: 1 potential issue noted in timeline context',
        status: 'warning',
        result: 'WARNING',
      },
      {
        id: 'act-init-3',
        timestamp: new Date(Date.now() - 49 * 1000).toISOString(),
        action: "Retrieved Riya's character profile",
        tool: 'get_character',
        input: { name: 'Riya' },
        outputSummary: "Retrieved Riya's emotional arc and character dossier",
        status: 'success',
        result: 'SUCCESS',
      },
      {
        id: 'act-init-2',
        timestamp: new Date(Date.now() - 51 * 1000).toISOString(),
        action: 'Retrieved Scene 7',
        tool: 'get_current_scene',
        input: { sceneId: 'scene-7' },
        outputSummary: 'Retrieved Scene 07 ("Take Seven, Played")',
        status: 'success',
        result: 'SUCCESS',
      },
      {
        id: 'act-init-1',
        timestamp: new Date(Date.now() - 52 * 1000).toISOString(),
        action: 'Retrieved project context',
        tool: 'get_story_context',
        input: {},
        outputSummary: 'Retrieved project context and 8 Director Memory rules',
        status: 'success',
        result: 'SUCCESS',
      },
    ],
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  }
}
