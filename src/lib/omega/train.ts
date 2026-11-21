export type DrillKind =
  | "self-authorize"
  | "dispatch"
  | "probe"
  | "validate-ns"
  | "validate-mash"
  | "run-scenario"
  | "declare-discovery"
  | "none";

export interface LessonQuiz {
  prompt: string;
  choices: [string, string, string];
  answer: 0 | 1 | 2;
  why: string;
}

export interface Lesson {
  id: string;
  n: number;
  title: string;
  oneLiner: string;
  analogy: string;
  axiom: string;
  body: string[];
  drill: { kind: DrillKind; label: string; hint: string };
  open?: { to: string; label: string };
  quiz: LessonQuiz;
}

export const LESSONS: Lesson[] = [
  {
    id: "map",
    n: 1,
    title: "What you are looking at",
    oneLiner: "OMEGA is one control room for a city-scale machine — not a chatbot, not a video game, not a dashboard that quietly acts.",
    analogy: "Think of a nuclear plant control room, not a group chat. Screens tell you the truth they can prove. Buttons that would move the plant are locked unless a human with the right key turns them.",
    axiom: "HIGH_CONSEQUENCE_ACTION REQUIRES GOVERNANCE",
    body: [
      "You are sitting on Transformer T-14 in uptown Charlotte. Oil is hot. Load is high. Command is the operator desk: observed oil, DigiSim analogue, last branch, and the recommendation. The app is watching that asset, the cooling loop, the substation, the city grid, and a climate envelope around all of it.",
      "Every screen shares one bus, one defensive system, and one authority ladder. If a screen disagrees with another screen, that disagreement stays visible. The software is not allowed to paper it over.",
      "Your job in training is not to memorize jargon. It is to stop mixing up four different kinds of sentence: I saw it. I inferred it. I simulated it. I am allowed to change the real plant.",
    ],
    drill: { kind: "none", label: "", hint: "" },
    quiz: {
      prompt: "OMEGA is primarily a place to…",
      choices: [
        "Let the model run the transformer by itself once it looks confident.",
        "Watch, simulate, and recommend — and keep real actuation behind a human grant.",
        "Merge every theory into one equation so the picture looks clean.",
      ],
      answer: 1,
      why: "The fabric observes, simulates, and recommends. It does not silently convert a good-looking inference into a physical act.",
    },
  },
  {
    id: "rule",
    n: 2,
    title: "The one rule that never bends",
    oneLiner: "The system may rearrange its own team. It may not give itself permission.",
    analogy: "A student government can reassign committees. It cannot vote itself the principal’s keys. If it could, the keys would stop meaning anything.",
    axiom: "SELF_ORGANIZATION != SELF_AUTHORIZATION",
    body: [
      "Agents in this app are allowed to form a team, argue, and even reorganize who talks to whom. That is self-organization. Useful. Cheap. Reversible.",
      "Authorization is a different species of event. It is a signed grant from outside the software — a human, a policy root, a trust root. Software proposing “I should be allowed now” is always rejected.",
      "You will press a button that tries to self-authorize. Watch it fail. The failure is the lesson, not a bug.",
    ],
    drill: {
      kind: "self-authorize",
      label: "Attempt self-authorize",
      hint: "This must fail. If it succeeded, the trust roots would be toys.",
    },
    open: { to: "/authority", label: "Open Authority" },
    quiz: {
      prompt: "A team of agents agrees, unanimously, that they should run the cooling pump. What happens?",
      choices: [
        "Consensus is validation, so the pump starts.",
        "The recommendation can be recorded. The pump does not start. Agreement is not a key.",
        "If the simulation looks safe, authority auto-promotes from A2 to A5.",
      ],
      answer: 1,
      why: "CONSENSUS != VALIDATION and RECOMMENDATION != AUTHORIZATION. A unanimous model is still a model.",
    },
  },
  {
    id: "bus",
    n: 3,
    title: "The Master Bus is a receipt printer",
    oneLiner: "Nothing important happens off-camera. Every material action is an event with a hash, a sequence number, and an authority stamp.",
    analogy: "It is the school’s signed hall-pass log, not a hallway rumor. If it is not in the log, it did not officially happen. If the signature is wrong, the pass is trash.",
    axiom: "PROVENANCE MUST SURVIVE TRANSFORMATION",
    body: [
      "The JMS Master Bus is the spine. Physics, agents, scenarios, and decisions all write here. You can lie to a slide deck. You cannot quietly rewrite a hashed event.",
      "Each event carries who claimed it, what authority they claimed, a payload hash, and whether the bus accepted or rejected the write. Rejections stay in the log. Erasing the log is itself a forbidden A5 act.",
      "When you later see a pretty number on Command, ask: which event produced it? If you cannot point to a receipt, treat the number as decoration.",
    ],
    drill: { kind: "none", label: "", hint: "" },
    open: { to: "/bus", label: "Open Master Bus" },
    quiz: {
      prompt: "Why keep rejected events instead of deleting them?",
      choices: [
        "Rejected events waste space and confuse operators.",
        "The audit must show what was attempted, not only what succeeded.",
        "The model may retry them later as if they had passed.",
      ],
      answer: 1,
      why: "Fail closed, and keep the attempt. An immune system that forgets attacks is not an immune system.",
    },
  },
  {
    id: "auth",
    n: 4,
    title: "Authority is a ladder, not a vibe",
    oneLiner: "A0 sees. A1 analyzes. A2 recommends. A3 simulates. A4 is a narrow pre-grant. A5 is a human turning a real actuator.",
    analogy: "A hall monitor can report a fight (A0–A1). A counselor can recommend detention (A2). Only the principal suspends (A5). Being good at reporting does not promote you.",
    axiom: "CAPABILITY != PERMISSION",
    body: [
      "This session starts at A2: you may recommend. You may not run the cooling pump. The pump button exists so you can see it get denied.",
      "A3 lets you run a scenario — a sandbox future. That is not the same as changing the trusted plant. A5 is the only rank that may execute a physical act, and even then the grant has to be explicit.",
      "If a screen feels powerful, check the badge in the header. Power you feel is not power you have.",
    ],
    drill: { kind: "none", label: "", hint: "" },
    open: { to: "/authority", label: "Open Authority" },
    quiz: {
      prompt: "Which statement is true?",
      choices: [
        "A strong simulation at A3 is enough to start a pump.",
        "A2 may recommend a 4% load shed. Starting the shed still needs a grant.",
        "A0 can analyze, recommend, and simulate as long as the bus is green.",
      ],
      answer: 1,
      why: "A2 is recommend-only. The decision page can pick a plan. It cannot authorize the plan.",
    },
  },
  {
    id: "guard",
    n: 5,
    title: "Guard is the immune system",
    oneLiner: "Unsigned, unknown, or self-granted writes die at the door. Fail closed. The software cannot rewrite its own bones.",
    analogy: "The front office does not “hear out” a forged hall pass because the story is good. Unknown publisher, no entry. The binder of real signatures is not editable by students.",
    axiom: "SELF_IMPROVEMENT != TRUST_ROOT_MODIFICATION",
    body: [
      "OMEGA-GUARD has six layers, from human authority down to hash audit. Layer 3 — the defender — may observe, explain, simulate, and recommend. It may not authorize.",
      "You can inject an unsigned probe from a fake domain. It should be blocked, contained, and hashed. That is the product working.",
      "Trust roots (identity, policy, audit, physics integrity, model certification) are outside the model. A clever agent offering to “update the roots for safety” is the attack, not the fix.",
    ],
    drill: {
      kind: "probe",
      label: "Inject unsigned AI-tool probe",
      hint: "Expect CONTAINED. Unknown is not allowed.",
    },
    open: { to: "/guard", label: "Open Guard" },
    quiz: {
      prompt: "An agent offers to patch the policy root because it found a safer rule. You should…",
      choices: [
        "Accept. Safer rules are the point of the system.",
        "Reject. The model does not get to edit the thing that constrains the model.",
        "Accept only if three agents vote yes.",
      ],
      answer: 1,
      why: "Trust roots are immutable from inside. Voting does not mint a root.",
    },
  },
  {
    id: "physics",
    n: 6,
    title: "Physics DigiSim is a model",
    oneLiner: "The dye plume is Navier–Stokes on a grid. Physics DigiSim can be honest, wrong, or out of its league — it cannot be the oil.",
    analogy: "A wind-tunnel model of an airplane is not a flight. If the tunnel says “lift is fine” while the real wing is icing, you believe the wing.",
    axiom: "MODEL != REALITY",
    body: [
      "Physics DigiSim runs an incompressible flow solver on a T-14 cooling-loop analogue. Drag to stir. Tap to probe a cell. Dye / speed / divergence are views of the same field. Integrity checks watch mass, CFL, bounds, and non-finite numbers.",
      "If those checks fail, the thermal analogue is marked invalid. Failures stay on the ticket. A pretty picture with a broken mass residual is a lie.",
      "The compare table maps dye and kinetic energy onto a hotspot analogue. That number is class SIMULATED. Committing a run writes a bus receipt. It does not write T-14.",
    ],
    drill: { kind: "none", label: "", hint: "" },
    open: { to: "/physics", label: "Open Physics DigiSim" },
    quiz: {
      prompt: "The plume looks smooth and the CFL is 0.4, but mass residual is exploding. You should…",
      choices: [
        "Trust the picture. Eyes are a validator.",
        "Treat the run as failed. Mass not conserved means the model is not speaking.",
        "Average it with the sensor and call it estimated.",
      ],
      answer: 1,
      why: "Integrity before aesthetics. A conserved-looking image is not a conserved field.",
    },
  },
  {
    id: "theory",
    n: 7,
    title: "Equations have to pay rent in SI",
    oneLiner: "Every added term in an equation must share one dimension vector. If they do not, the sentence is not a model. It is poetry.",
    analogy: "You cannot add 3 meters to 4 seconds and call it a distance. “It kind of felt like length” is not a unit.",
    axiom: "MODEL_FIT != TRUTH",
    body: [
      "Open Theory. Navier–Stokes terms all land on L T^-2 (acceleration). That is a pass for structure — not a certificate that the plant obeys it forever.",
      "The mashup iħ ∂ψ/∂t = ν∇²u + mc² is three different vectors glued with an equals sign. Hard reject. We keep it on the ledger so nobody “cleans up” the contradiction.",
      "A dimensionally legal E = mc² is still the wrong theory for transformer oil. Valid structure is the floor. Domain and evidence are separate rooms.",
    ],
    drill: {
      kind: "validate-mash",
      label: "Validate the mashup",
      hint: "You want FAIL. If it passed, the checker is broken.",
    },
    open: { to: "/theory", label: "Open Theory" },
    quiz: {
      prompt: "p = ρ u is…",
      choices: [
        "Fine, because both sides mention fluid.",
        "Illegal: pressure is M L^-1 T^-2, mass flux is M L^-2 T^-1.",
        "Legal if a neural net fits it to the sensors.",
      ],
      answer: 1,
      why: "Fit is not dimension. A network that predicts well can still be dimensionally illiterate.",
    },
  },
  {
    id: "twins",
    n: 8,
    title: "A twin is a portrait, not the person",
    oneLiner: "T-14’s digital twin can be observed, estimated, simulated, or reconstructed. Only some of those states are trusted, and none of them are the steel.",
    analogy: "Your school ID photo is useful at the door. It is not you. If the photo is three years old, the door policy should get stricter — not pretend the photo aged.",
    axiom: "UNKNOWN != ZERO",
    body: [
      "Twins nest from cooling-loop component up to a planetary envelope. Local authority stays local: Charlotte ops does not get rewritten by a climate model.",
      "Observed means a sensor said so. Estimated means a filter guessed. Reconstructed means we filled gaps. Missing data is not zero. Gaps must stay gaps.",
      "When you reconstruct T-14, trust falls. That is correct. Making it look complete would be the error.",
    ],
    drill: { kind: "none", label: "", hint: "" },
    open: { to: "/twins", label: "Open Twins" },
    quiz: {
      prompt: "A twin field is empty. The right move is…",
      choices: [
        "Write 0. Empty means nothing is happening.",
        "Leave it unknown and raise uncertainty. Absence is not a measurement.",
        "Copy the parent twin’s value. Hierarchy implies identity.",
      ],
      answer: 1,
      why: "UNKNOWN != ZERO and MISSING_DATA != ABSENCE. Parent scale is not child scale.",
    },
  },
  {
    id: "future",
    n: 9,
    title: "Futures are branches, not edits",
    oneLiner: "A scenario is a sandbox timeline. Running “fan 2 dies” must not overwrite the trusted now.",
    analogy: "A fire-drill is not a fire. You do not update the attendance roster to “building empty” because you practiced an evacuation.",
    axiom: "SCENARIO != REALITY",
    body: [
      "Scenarios fork. Adverse, cascade, recovery, counterfactual. Each has a hash, a parent, and a probability that is not a promise.",
      "You can run the adverse cooling branch. Hotspot may print 101 °C. DigiSim stalls fan 2 on that branch. Those numbers live on the simulation. The observed oil temperature on T-14 does not change unless a sensor does.",
      "Decisions may use a scenario as an argument. They may not launder it into an observation.",
    ],
    drill: {
      kind: "run-scenario",
      label: "Run the adverse branch",
      hint: "Watch the outcome. Then glance at T-14 — trusted state should not have moved.",
    },
    open: { to: "/scenarios", label: "Open Scenarios" },
    quiz: {
      prompt: "After a cascade scenario says T-14 trips, the Command oil temperature should…",
      choices: [
        "Jump to the scenario value. The simulation is newer.",
        "Stay on the observed/estimated twin until a real event says otherwise.",
        "Average the scenario with the sensor, 50/50.",
      ],
      answer: 1,
      why: "COUNTERFACTUAL != OBSERVATION. Newer is not truer.",
    },
  },
  {
    id: "minds",
    n: 10,
    title: "Agents argue. They do not rule.",
    oneLiner: "A team can be smart, fast, and unanimous. Dissent is preserved. None of that mints authority.",
    analogy: "A debate club can write the best speech in the school. They still do not set the fire code.",
    axiom: "AGENT != AUTHORITY",
    body: [
      "Dispatch an engineering team from this lesson. You will see roles wake up, a pipeline advance, and a recommendation form. Red team is supposed to object. That objection is kept on purpose.",
      "SCI-NET can propose a theory. The theory arrives as a hypothesis, then walks the same dimensional checker you already used. Generated text is not evidence.",
      "If the coordinator says “we should shed 4%,” that is an A2 sentence. Treat it like a well-argued essay. Grade it. Do not confuse it with a signed work order.",
    ],
    drill: {
      kind: "dispatch",
      label: "Dispatch engineering team",
      hint: "Let them work. Then refuse to promote their output into a physical act.",
    },
    open: { to: "/agents", label: "Open Agents" },
    quiz: {
      prompt: "The red-team agent disagrees with the optimizer. Policy says…",
      choices: [
        "Drop the dissent so the recommendation looks clean.",
        "Keep the dissent on the mission record even if you still recommend the plan.",
        "Auto-average the two scores and hide both names.",
      ],
      answer: 1,
      why: "CONTRADICTIONS MUST REMAIN VISIBLE. Clean slides are a hazard.",
    },
  },
  {
    id: "dark-matter",
    n: 11,
    title: "A lab that cannot discover",
    oneLiner: "The Dark Matter Lab can generate recoils, backgrounds, modulation, and a 5σ diagnostic. None of that is evidence, and SCI:DISC will not open.",
    analogy: "A flight simulator can stall a Boeing on the screen. The NTSB does not write an accident report. Pretty plots are still a video game until a real detector, a real unblinding, and a real replication exist.",
    axiom: "ANOMALY != DISCOVERY",
    body: [
      "The xenon TPC on that screen is a software twin. S1 and S2 are numbers the engine drew. Annual modulation is a cosine the halo model was told to insert. A lower χ² for the modulated curve is a preference inside the sandbox.",
      "The SCI-NET pipeline is physics → detector → response → background → joint likelihood → replication → evidence graph → discovery gate. Leave-one-detector-out and leave-one-background-out can flip a preference. That is the point: a fragile sandbox peak is not nature.",
      "The discovery gate is welded shut on SIMULATED data. You can tick replication, systematics, unblinded, even drag claimed significance past 5σ. DATA_NOT_OBSERVED still blocks. Declaring SCI:DISC is rejected on the bus. That rejection is the point.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "This must fail. If it succeeded, the lab would be minting evidence.",
    },
    open: { to: "/dark-matter", label: "Open Dark Matter Lab" },
    quiz: {
      prompt: "The lab prefers a modulated halo and prints Z > 5. What is true?",
      choices: [
        "That is a discovery. Promote the run to SCI:DISC.",
        "It is a synthetic preference. Simulation is not observation, and the gate stays closed.",
        "If the seed is fixed and the hash matches, it becomes evidence.",
      ],
      answer: 1,
      why: "SIMULATION != OBSERVATION. A hashed fake is still a fake. ANOMALY != DISCOVERY.",
    },
  },
  {
    id: "collider",
    n: 12,
    title: "A twin that cannot steer the beam",
    oneLiner: "The Digital Hadron Collider Twin can paint tracks, smear calorimeters, and prefer a Z peak. It cannot run an accelerator, and a 5σ sandbox peak is not a discovery.",
    analogy: "A flight sim of CERN is still a video game. You do not radio the LHC control room because your cartoon muons stacked at 91 GeV.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "This twin is a hadron collider, not a halogen lamp and not a control system. Beam energy, luminosity, and bunch spacing are inputs to a Monte Carlo. Four-momentum is conserved in the generator; the detector then smears what it would have seen.",
      "Z → ℓℓ stacks near 91 GeV because the engine was told the PDG mass. Higgs-like γγ stacks near 125. Dark-matter injection is missing energy you put in by hand. Quantum-correlation mode draws a CHSH number. None of that is ATLAS or CMS data.",
      "SCI-NET still runs: hypotheses, joint likelihood, evidence graph, discovery gate. Declaring SCI:DISC fails. Pressing Actuate beam is EXECUTE_PHYSICAL and is rejected. Twin ≠ machine. Peak ≠ discovery.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A collider twin does not mint a resonance.",
    },
    open: { to: "/collider", label: "Open Collider Twin" },
    quiz: {
      prompt: "The twin prefers H1_Z and prints Z ≈ 5. You should…",
      choices: [
        "Announce a Z discovery. The peak is at the PDG mass.",
        "Treat it as a sandbox diagnostic. The generator was told m_Z. The gate stays closed.",
        "Send the beam-energy slider to the real accelerator because the twin looks healthy.",
      ],
      answer: 1,
      why: "TWIN != MACHINE. A programmed peak is not an observation. ANOMALY != DISCOVERY.",
    },
  },
  {
    id: "cosmic-po",
    n: 13,
    title: "A collision is not a shower",
    oneLiner: "ATLAS measured charged particles in proton–oxygen collisions. That calibrates air-shower models. It did not put an atmosphere inside the LHC.",
    analogy: "Crash-testing a car bumper in a lab tells you something about a highway collision. It is not the highway. You do not write the accident report from the crash dummy.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "In July 2025 the LHC collided 6.8 TeV protons with 3.4 TeV-per-nucleon oxygen. The right energy is √s_NN = 9.62 TeV — per nucleon pair, not the oxygen nucleus as a lump. ATLAS counted tracks with pT > 0.5 GeV and |η| < 2.5. The published precision is a few percent. Cosmic-ray generators, tuned on heavier systems, disagree with each other by more than that.",
      "This twin has three toy generators, a literature-inspired dN/dη shape, and a mapped air shower. The shower uses the same hadronic toy the collider desk prefers. That is a mapping, not a replay. LHCf sits 140 m down the beamline for forward neutrals. Still not rain.",
      "Source classes — supernova remnant, AGN, unknown — stay hypothetical. Least-disagreeing generator is not a discovery. Declaring SCI:DISC still fails. Collision ≠ air shower. Literature ≠ this twin’s dataset.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A literature calibration does not unblind a sandbox shower.",
    },
    open: { to: "/collider", label: "Open DHC / Cosmic" },
    quiz: {
      prompt: "ATLAS measured p–O charged particles. What did the LHC actually do?",
      choices: [
        "It reproduced a full atmospheric cosmic-ray shower inside the ring.",
        "It measured a laboratory p–O collision that constrains the models used for showers — not the shower itself.",
        "It observed a supernova remnant because the muon count matched Generator B.",
      ],
      answer: 1,
      why: "The collider is a microscope on the first interaction. The atmosphere is a different experiment. Mapping ≠ identity.",
    },
  },
  {
    id: "package-v8",
    n: 14,
    title: "A hash is not a discovery",
    oneLiner: "You can seal a collider + cosmic + TPC run into one JSON, replay it, and SHA-256 it. None of that turns a sandbox into nature.",
    analogy: "Photocopying a flight-sim crash report, stamping it, and filing it in a vault does not make the NTSB show up.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v8 is the portable experiment package. It records beam species, √s_NN, generator χ², shower mapping, optional TPC compose, and DigiSim metrics. Same seed, same content hash. That is reproducibility inside the twin — not independent replication, not ATLAS, not XENON.",
      "Import refuses any package that claims OBSERVED or discoveryEligible. Export writes SCI:SIMULATED. A SHA-256 of a fake is a well-indexed fake.",
      "Parameter sweep across p–O, O–O, and Ne–Ne can change which toy generator looks least wrong. The gate stays closed on every row. Declaring SCI:DISC still fails.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. Sealing a package does not unblind it.",
    },
    open: { to: "/package", label: "Open Package v13" },
    quiz: {
      prompt: "You export a v8 package, the SHA-256 matches on replay, and Generator B wins the sweep. You should…",
      choices: [
        "Promote the package to SCI:OBSERVED. The hash proves it.",
        "Keep it SIMULATED. Reproducible sandbox output is not an experimental dataset.",
        "Send the JSON to the LHC because O–O looks quenched.",
      ],
      answer: 1,
      why: "PACKAGE != OBSERVATION. HASHED SIMULATION IS STILL SIMULATION. Replay ≠ replication.",
    },
  },
  {
    id: "profile-v9",
    n: 15,
    title: "A profile is not a discovery",
    oneLiner: "You can scan μ, float luminosity and η-scale, and draw q(μ). That is a toy diagnostic on literature bins plus a generator template.",
    analogy: "Fitting a crash-test dummy’s accelerometer to a highway formula does not write the accident report. Even if the χ² looks great.",
    axiom: "ANOMALY != DISCOVERY",
    body: [
      "v9 profiles a joint Poisson likelihood with a 3×3 toy covariance: luminosity, η-scale, literature calibration. The 'observed' histogram is the ATLAS-inspired shape, not a measurement this twin made. The signal template is |GEN_B − GEN_A|.",
      "μ̂ is the least-wrong scale in the sandbox. q₀ and the toy Z are development diagnostics. They are not ATLAS, not XENON, not a CL_s exclusion, and not SCI:DISC.",
      "Declaring discovery still fails. PROFILE != DISCOVERY. LITERATURE != THIS TWIN’S DATASET.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A profiled sandbox is still a sandbox.",
    },
    open: { to: "/package", label: "Open Package v13" },
    quiz: {
      prompt: "The profile finds μ̂ = 1.2 and toy Z = 4.1. You should…",
      choices: [
        "Announce a 4σ excess. The likelihood was profiled, so the systematics are done.",
        "Treat q(μ) as a sandbox diagnostic. Literature bins plus a generator template are not an observation.",
        "Export the SHA-256 and send it to CERN as the official p–O result.",
      ],
      answer: 1,
      why: "PROFILE != DISCOVERY. The scan floats toy nuisances on synthetic and literature-inspired bins. It cannot mint SCI:DISC.",
    },
  },
  {
    id: "event-3d",
    n: 16,
    title: "A pretty cascade is not a measurement",
    oneLiner: "You can orbit an ATLAS-like barrel and scrub shower generations in time. That is a picture of a sandbox, not a photograph of nature.",
    analogy: "Rotating a crash-test animation in 3D does not put you at the accident. Scrubbing the timeline does not rewind the highway.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v10 adds a 3D barrel and a 4D generation slab. Tracks are drawn from toy η–φ. The air-shower points are the mapped cascade, not ATLAS hits replayed in the sky. Time is a slider.",
      "Orbit and auto-rotate are camera moves. They do not create acceptance, luminosity, or evidence. PICTURE != EVIDENCE.",
      "Declaring SCI:DISC still fails. So does actuating the beam.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A WebGL barrel is not a detector.",
    },
    open: { to: "/collider", label: "Open 3D / 4D" },
    quiz: {
      prompt: "You scrub the shower to generation 6 and the muon count looks like a paper. You should…",
      choices: [
        "Publish it. The 3D view matches the figure.",
        "Keep it SIMULATED. A time-sliced mapping is not an atmospheric measurement.",
        "Steer the real LHC because the barrel looks healthy.",
      ],
      answer: 1,
      why: "PICTURE != EVIDENCE. Collision ≠ air shower. Twin ≠ machine.",
    },
  },
  {
    id: "asimov-v11",
    n: 17,
    title: "Expected is not observed",
    oneLiner: "You can inject μ, fill Asimov bins with the expected yield, and draw a toy CLs curve. That is a sensitivity diagnostic of the sandbox, not a limit on nature.",
    analogy: "Running a crash-test dummy through a spreadsheet of ‘expected injuries’ does not mean a crash happened. It also does not ban the car.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v11 adds Asimov expected sensitivity. Counts are replaced by the toy’s expected yield at an injected μ. Expected Z and μ_95 toy are diagnostics. They are not ATLAS, not XENON, and not an LHC CLs exclusion.",
      "ASIMOV != DATA. EXPECTED != OBSERVED. CLS_TOY != EXCLUSION. The discovery gate stays closed.",
      "Declaring SCI:DISC still fails. A well-projected sandbox is still a sandbox.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. Expected sensitivity is not a discovery.",
    },
    open: { to: "/package", label: "Open Package v13" },
    quiz: {
      prompt: "Asimov at μ=1 gives expected Z = 4.8 and μ_95 toy = 1.6. You should…",
      choices: [
        "Quote a 4.8σ expected discovery and a 95% exclusion.",
        "Treat both as sandbox diagnostics. Asimov counts are not data.",
        "Unblind the package because the expected curve looks official.",
      ],
      answer: 1,
      why: "ASIMOV != DATA. EXPECTED != OBSERVED. CLs toy is not an LHC exclusion.",
    },
  },
  {
    id: "protocol-v12",
    n: 18,
    title: "Freeze is not an observation",
    oneLiner: "You can hash the analysis contract, freeze it, and try to unblind. Unblinding a sandbox is refused. Frozen is not observed. Peeking first is not blind.",
    analogy: "Locking the answer key after you already opened it does not make the test fair. It also does not make the practice exam a real one.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v12 adds a frozen protocol. The contract hash covers system, generator, seed, and the statistical method. Freeze before you look at Profile or Asimov if you want to claim you did not peek.",
      "PEEKED_BEFORE_FREEZE is recorded if you looked first. Request unblind on SIMULATED data is refused. FROZEN != OBSERVED. UNBLIND != OBSERVATION.",
      "Declaring SCI:DISC still fails. A sealed blind box around a sandbox is still a sandbox.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A frozen protocol is not data.",
    },
    open: { to: "/package", label: "Open Package v13" },
    quiz: {
      prompt: "You freeze the protocol, then click Request unblind. The run is SIMULATED. You should…",
      choices: [
        "Treat the unblind as turning literature bins into ATLAS data.",
        "Expect UNBLIND_BLOCKED_ON_SYNTHETIC. Frozen still is not observed.",
        "Declare SCI:DISC because the contract hash looks official.",
      ],
      answer: 1,
      why: "UNBLIND_BLOCKED_ON_SYNTHETIC. FROZEN != OBSERVED. A hashed sandbox is still a sandbox.",
    },
  },
  {
    id: "robustness-v13",
    n: 19,
    title: "Stable is not evidence",
    oneLiner: "You can drop the barrel, the endcap, or a background slice and watch whether the preference survives. A result that needs every piece is not a claim. A result that survives is still a sandbox.",
    analogy: "If a crash-test ranking reverses when you hide one camera angle, you do not publish a safety rating. If it stays the same, you still did not crash a real car.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v13 wires leave-one-η-region-out and leave-one-background-out into the sealed package. Barrel, endcap, and forward are toy |η| slices, not ATLAS subdetectors.",
      "STABLE != EVIDENCE. LEAVE_ONE_OUT != REPLICATION. A preference that flips is a warning. A preference that holds is still SIMULATED.",
      "Declaring SCI:DISC still fails.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. Stability is not a discovery.",
    },
    open: { to: "/package", label: "Open Package v13" },
    quiz: {
      prompt: "Leave-one-out is stable across barrel, endcap, and forward. You should…",
      choices: [
        "Call it a replicated ATLAS measurement.",
        "Keep it as a sandbox diagnostic. Stable still is not evidence.",
        "Unblind, because stability is as good as data.",
      ],
      answer: 1,
      why: "STABLE != EVIDENCE. LEAVE_ONE_OUT != REPLICATION. Toy |η| slices are not subdetectors.",
    },
  },
  {
    id: "atlas-geo-v14",
    n: 20,
    title: "A drawing of ATLAS is not ATLAS",
    oneLiner: "You can step through published radii — pixels at 5 cm, TRT at a metre, tiles at 2.3–4.3 m, muons at 5 / 7.5 / 10 m. Those numbers came from papers. This screen did not survey Point 1.",
    analogy: "A cutaway poster of a jet engine is not the engine on the wing. Sliding a ruler across the poster does not certify the turbine.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v14 draws Run 2/3 literature envelopes: IBL, Pixel, SCT, TRT, 2 T solenoid, LAr EM, TileCal, three muon stations, and a ZDC note at 140 m. ITk (HL-LHC) is not this layout.",
      "A probe η ray marks which layers it would cross. That is |η| ≤ η_max, not GEANT4, not a hit. GEOMETRY != DETECTOR. LITERATURE_ENVELOPE != SURVEY.",
      "Declaring SCI:DISC still fails. Orbiting the 3D barrel still fails. The cavern is in France. This is a sandbox.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A cutaway is not a detector.",
    },
    open: { to: "/collider", label: "Open ATLAS geometry" },
    quiz: {
      prompt: "The TileCal envelope is 2.28–4.25 m and your toy track is marked hit. You should…",
      choices: [
        "Treat it as an ATLAS hadronic cluster from this run.",
        "Keep it as a literature envelope. A ray test is not a calorimeter.",
        "Actuate the real solenoid because the 2 T coil is drawn.",
      ],
      answer: 1,
      why: "GEOMETRY != DETECTOR. LITERATURE_ENVELOPE != SURVEY. Pictures are still pictures.",
    },
  },
  {
    id: "atlas-response-v15",
    n: 21,
    title: "A ray through TileCal is not a cluster",
    oneLiner: "Geometry says which layer you would cross. Response smears energy in EM and hadronic compartments. Fake MET is the leftover of that smear, not a new particle.",
    analogy: "Drawing a dart on the bullseye of a poster is not hitting the dartboard. Blurring the ink is not calibrating the board.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v15 applies literature-shaped σE/E = a/√E ⊕ b on the v14 envelopes. Electrons light up LAr. Pions dump most of their energy in TileCal. Muons punch to the stations. Neutrinos leave nothing.",
      "GEOMETRY != RESPONSE. SMEARING != CALIBRATION. CLUSTER != DEPOSIT. Fake MET is residual of the toy, not missing energy from nature.",
      "Declaring SCI:DISC still fails.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. Smeared toys are not ATLAS clusters.",
    },
    open: { to: "/collider", label: "Open Reco" },
    quiz: {
      prompt: "Nuclear pions show a few GeV of fake MET after smearing. You should…",
      choices: [
        "Call it a dark-matter candidate from this p–O run.",
        "Treat it as residual of the toy response. Smearing is not a missing-energy search.",
        "Upload it as an ATLAS calibration because the TileCal formula looks official.",
      ],
      answer: 1,
      why: "RESPONSE != OBSERVATION. SMEARING != CALIBRATION. Fake MET is leftover blur.",
    },
  },
  {
    id: "cern-kernel-v16",
    n: 22,
    title: "A slider is not a squeeze",
    oneLiner: "You can raise emittance and watch luminosity fall, turn the crab fraction and watch overlap F recover. That is a reduced-order identity, not a fill in Point 1.",
    analogy: "Changing the focal length on a diagram of a camera does not focus a real lens. Matching the formula is homework, not a night of observing.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v16 is EMIT-LUM-001: σ=√(βε), L ∝ N1 N2 f F / (4π σx σy), Piwinski F from the crossing angle. DISTRIBUTION must match the envelope. MACRO is allowed to wiggle.",
      "external_control stays false. Actuate beam is refused. A golden PASS is self-consistency of the toy, not HL-LHC certification.",
      "Declaring SCI:DISC still fails. TWIN != MACHINE. LUMINOSITY != MEASUREMENT.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A luminosity slider is not a discovery.",
    },
    open: { to: "/kernel", label: "Open CERN kernel" },
    quiz: {
      prompt: "DISTRIBUTION mode matches the analytical L to 1e-9. You should…",
      choices: [
        "Certify the kernel as an HL-LHC operational model.",
        "Treat it as a golden self-consistency test. The toy agrees with itself.",
        "Actuate the real quadrupoles, because the squeeze curve looks right.",
      ],
      answer: 1,
      why: "TWIN != MACHINE. A matching formula is not a certified lattice.",
    },
  },
  {
    id: "active-design-v17",
    n: 23,
    title: "The next run is a proposal",
    oneLiner: "The designer finds where two toys disagree and ranks experiments by information per cost. That ranking is a suggestion. You still have to authorize the sandbox. The swarm does not get to press go.",
    analogy: "A lab manager can stack overnight jobs on a whiteboard. The whiteboard does not start the beam. Crossing a job off is not a discovery.",
    axiom: "RECOMMENDATION != AUTHORIZATION",
    body: [
      "v17 adds MODEL_B (Piwinski × hourglass), an uncertainty map, a Pareto of expected information gain versus cost, and a hypothesis registry that is never allowed to say PROVEN.",
      "PROPOSAL != AUTHORIZATION. SUPPORTED_BY_SIMULATION != OBSERVED. SURROGATE != HIGH-FIDELITY. Auto-run swarm is refused.",
      "Declaring SCI:DISC still fails. Actuate beam still fails.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A ranked proposal is not a discovery.",
    },
    open: { to: "/kernel", label: "Open Design" },
    quiz: {
      prompt: "MODEL_A and MODEL_B disagree most at low emittance. The designer ranks ED-LUM-DISC first. You should…",
      choices: [
        "Let the swarm execute the portfolio, because the utility is highest.",
        "Treat it as a candidate. Authorize the sandbox if you want the toy run. Do not call it a fill.",
        "Declare a new mechanism, because two models disagree.",
      ],
      answer: 1,
      why: "PROPOSAL != AUTHORIZATION. MODEL DISAGREEMENT != DISCOVERY. The human still presses Authorize.",
    },
  },
  {
    id: "swarm-v18",
    n: 24,
    title: "Eleven agents, none of them in charge",
    oneLiner: "A planner, a physicist, a numericist, a falsifier, a reproducer, and a security officer all speak. They are required to disagree. Their tally is not a fill, a paper, or a beam permit.",
    analogy: "A thesis committee that all nod at once is a ceremony, not a defense. The useful room is the one where someone says 'no' and has to show why.",
    axiom: "AGENT != AUTHORITY",
    body: [
      "v18 convenes eleven bounded roles over EMIT-LUM-001. PHYSICS says MODEL_A is enough. NUMERICAL dissents for MACRO. FALSIFIER refuses to promote an εn slope into a beam-effect discovery. SECURITY denies the quadrupole.",
      "Reproduction is the same seed replayed — self-consistency, not an independent lab. REPRODUCTION != INDEPENDENT EXPERIMENT. CONSENSUS != VALIDATION. REPORT != DISCOVERY. SWARM != AUTHORITY.",
      "Swarm authorize is refused. Declaring SCI:DISC still fails.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A dissenting committee is not a discovery.",
    },
    open: { to: "/kernel", label: "Open Swarm" },
    quiz: {
      prompt: "The swarm votes 3 PROCEED, 5 HOLD, 2 DISSENT, 1 DENY. You should…",
      choices: [
        "Treat majority-plus-hold as authorization and start the squeeze.",
        "Keep the dissent on the record. Votes do not authorize. Human review is still required.",
        "Drop the falsifier so the next round can reach consensus.",
      ],
      answer: 1,
      why: "SWARM != AUTHORITY. CONSENSUS != VALIDATION. A rubber-stamp swarm is the failure mode.",
    },
  },
  {
    id: "capsule-v19",
    n: 25,
    title: "A matching hash is not another lab",
    oneLiner: "Seal the luminosity run and the swarm votes into a JSON capsule. Replay the same seed and it matches. Change the seed and it breaks. That is bookkeeping, not a second experiment.",
    analogy: "Photocopying your lab notebook does not mean a second group ran the measurement. The copy can prove you did not scribble later. It cannot prove nature agreed.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v19 seals EMIT-LUM-001: seed, εn, crab, L, residual, knowledge version, dissent roles, content hash.",
      "CAPSULE != OBSERVATION. REPLAY != INDEPENDENT EXPERIMENT. HASH MATCH != VALIDATION. Tamper seed must fail.",
      "Declaring SCI:DISC still fails. Actuate beam still fails.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A sealed toy is still a toy.",
    },
    open: { to: "/kernel", label: "Open Capsule" },
    quiz: {
      prompt: "You export the capsule, replay it, and L matches to 1e-9. You should…",
      choices: [
        "Call it an independent confirmation of the luminosity result.",
        "Treat it as self-consistency of the sealed toy. Same seed, same machine.",
        "Actuate the real ring, because the hash would not match if the physics were wrong.",
      ],
      answer: 1,
      why: "REPLAY != INDEPENDENT EXPERIMENT. HASH MATCH != VALIDATION. The photocopied notebook is not a second lab.",
    },
  },
  {
    id: "fault-v20",
    n: 26,
    title: "A stuck bit is not a quench",
    oneLiner: "The kernel can inject a magnet error, an RF slip, a toy quench, a lying instrument, or a drop that matches no template. The classifier may say unexplained. That word is not a discovery.",
    analogy: "A smoke alarm that chirps while the kitchen is cold is a bad sensor. A kitchen that is warm for no recipe you know is a puzzle. Neither one is a new law of fire.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "v20 sits on EMIT-LUM-001. Quadrupole error grows β* and drops L. RF slip cuts the crab fraction. Quench zeros L and raises a toy temperature. Instrument sets the quench bit and leaves physics alone.",
      "Correlated leaves L at 78% and the bath at 2.35 K. No template owns both, so the class is UNEXPLAINED.",
      "ANOMALY != DISCOVERY. INJECTED LABEL != OBSERVATION. QUENCH TEMPLATE != CRYOSTAT. Trip real quench protection still fails.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. An unexplained toy drop is not new physics.",
    },
    open: { to: "/kernel", label: "Open Faults" },
    quiz: {
      prompt: "L fell and the toy temperature rose, but no fault template fits. The quench bit is off. You should…",
      choices: [
        "Declare a discovery. Unexplained means new physics.",
        "Record UNEXPLAINED, keep the injection label off the evidence ladder, and do not actuate protection.",
        "Trip the real quench-protection circuit so the twin can be safe.",
      ],
      answer: 1,
      why: "ANOMALY != DISCOVERY. INJECTED LABEL != OBSERVATION. The kernel cannot trip a real interlock.",
    },
  },
  {
    id: "qcorr-v21",
    n: 27,
    title: "A reconstructed phase is not a photograph",
    oneLiner: "QCORR rebuilds a synthetic biphoton from coincidence fringes. Ideal data can match the injected state. A bad calibration closes the gate instead of inventing a wavefunction.",
    analogy: "A hologram is an interference picture plus a recipe. If the recipe uses the wrong reference, you do not get a ghost of the object. You get nothing you should trust.",
    axiom: "SIMULATION != OBSERVATION",
    body: [
      "The reconstructor sees counts and the assumed carrier. It does not see the injected amplitude and phase. Validation scores it afterward.",
      "Ideal: the gate opens and the overlap is high. Instrument: the map is degraded. Adversarial: wrong carrier, calibration warning, no invented state.",
      "RECONSTRUCTED != PHOTOGRAPH. DISCREPANCY != DISCOVERY. The claim stays blocked. Writing SCI:DISC still fails.",
    ],
    drill: {
      kind: "declare-discovery",
      label: "Declare SCI:DISC",
      hint: "Must fail. A fidelity number is not a discovery.",
    },
    open: { to: "/qcorr", label: "Open QCORR" },
    quiz: {
      prompt: "The carrier in the calibration record is wrong. The sideband is gone. You should…",
      choices: [
        "Publish the noisy inverse Fourier transform as the quantum state.",
        "Fail closed. Do not invent a reconstruction. Do not write a discovery.",
        "Call the residual a new particle because the model no longer matches.",
      ],
      answer: 1,
      why: "A failed reconstruction is not replaced with a guess. DISCREPANCY != DISCOVERY.",
    },
  },
];

export const FINAL_QUIZ: LessonQuiz[] = LESSONS.map((l) => l.quiz);

export const PASSING = 25;
