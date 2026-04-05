export type Assignment = {
  id: number;
  slug: string;
  title: string;
  shortDesc: string;
  tags: string[];
  objective: string;
  theory: string;
  implementation: string[];
  learningOutcomes: string[];
  files: { label: string; filename: string; type: string }[];
};

export const assignments: Assignment[] = [
  {
    id: 1,
    slug: "assignment-1",
    title: "Gaussian Random Variable Distribution",
    shortDesc: "Learn probability distributions and statistical analysis through interactive Gaussian distribution simulation with real-time parameter adjustment.",
    tags: ["Statistical Analysis", "MATLAB Programming", "Signal Modeling"],
    objective: "Create MATLAB code to generate and plot a Gaussian random variable distribution, demonstrating understanding of probability distributions and MATLAB programming.",
    theory: "A Gaussian (Normal) distribution is a continuous probability distribution characterized by Mean (μ) as the center of the distribution, Standard deviation (σ) as the spread, and PDF: f(x) = (1/(σ√(2π))) * e^(-(x-μ)²/(2σ²))",
    implementation: [
      "Generate random samples from a Gaussian distribution",
      "Create multiple visualizations to analyze the distribution",
      "Compare empirical results with theoretical values",
      "Display statistical measures"
    ],
    learningOutcomes: [
      "Understanding Gaussian distribution properties",
      "MATLAB programming for statistical analysis",
      "Data visualization techniques",
      "Comparison of empirical vs theoretical results",
      "Statistical validation methods"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "gaussian_distribution.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment1_GaussianDistribution.md", type: "Guide" }
    ]
  },
  {
    id: 2,
    slug: "assignment-2",
    title: "Path Loss and Shadowing Analysis",
    shortDesc: "Explore wireless propagation models including free space path loss, log-distance models, and shadowing effects in various environments.",
    tags: ["Propagation Models", "Link Budget", "Coverage Planning"],
    objective: "Simulate and analyze path loss and shadowing models across different wireless environments.",
    theory: "Path loss models describe how signal power decreases with distance. Log-distance model: PL(d) = PL(d0) + 10n*log10(d/d0) + Xσ where n is path loss exponent and Xσ is shadowing (zero-mean Gaussian random variable in dB).",
    implementation: [
      "Implement free space path loss model",
      "Apply log-distance path loss model for different environments",
      "Add log-normal shadowing component",
      "Plot received power vs distance for multiple scenarios"
    ],
    learningOutcomes: [
      "Understanding large-scale fading effects",
      "Link budget calculation skills",
      "Coverage area estimation techniques",
      "Environment-specific propagation modeling"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "path_loss_shadowing.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment2_PathLoss.md", type: "Guide" }
    ]
  },
  {
    id: 3,
    slug: "assignment-3",
    title: "Hata-Okumura and Two-Ray Models",
    shortDesc: "Compare empirical and theoretical propagation models for different environments and understand their applications in cellular networks.",
    tags: ["Empirical Models", "Theoretical Analysis", "Urban Propagation"],
    objective: "Implement and compare the Hata-Okumura empirical model and Two-Ray ground reflection model for path loss prediction.",
    theory: "Hata-Okumura model provides empirical path loss formulas for urban, suburban, and rural areas based on measurements. Two-Ray model accounts for direct path and ground-reflected path: PL = (4πd/λ)² * (ht*hr/d²)^(-2) at large distances.",
    implementation: [
      "Implement Hata-Okumura model for urban environment",
      "Extend model for suburban and open areas",
      "Implement Two-Ray ground reflection model",
      "Compare models across different distances and frequencies"
    ],
    learningOutcomes: [
      "Understanding empirical vs theoretical propagation models",
      "Cellular network planning fundamentals",
      "Frequency and height dependency of path loss",
      "Model selection for different deployment scenarios"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "hata_tworay.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment3_PropagationModels.md", type: "Guide" }
    ]
  },
  {
    id: 4,
    slug: "assignment-4",
    title: "Rician Fading and Jakes Doppler Spectrum",
    shortDesc: "Understand time-varying fading channels, LOS components, and Doppler effects in mobile communication systems.",
    tags: ["Fading Channels", "Doppler Effects", "Mobile Communications"],
    objective: "Simulate Rician fading channels and analyze the Jakes Doppler power spectrum for mobile communication scenarios.",
    theory: "Rician fading occurs when there is a dominant LOS component. The K-factor is the ratio of LOS power to scattered power. Jakes model simulates Doppler spread using sum-of-sinusoids: fd_max = v*fc/c where v is velocity, fc is carrier frequency.",
    implementation: [
      "Generate Rayleigh and Rician fading channel samples",
      "Implement Jakes sum-of-sinusoids model",
      "Plot Doppler power spectrum",
      "Analyze envelope distribution and level crossing rate"
    ],
    learningOutcomes: [
      "Understanding small-scale fading mechanisms",
      "Rician K-factor significance",
      "Doppler effect in mobile systems",
      "Channel simulation techniques"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "rician_jakes.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment4_RicianFading.md", type: "Guide" }
    ]
  },
  {
    id: 5,
    slug: "assignment-5",
    title: "Cellular Network Analysis with H4 Fading",
    shortDesc: "Simulate cellular networks with multiple users, H4 cascaded fading, and analyze the impact on data rates and system performance.",
    tags: ["Cellular Networks", "H4 Fading", "System Analysis"],
    objective: "Model a cellular network under H4 cascaded fading and evaluate system-level performance metrics.",
    theory: "H4 fading (cascaded Rayleigh) models situations with multiple scattering clusters. In cellular networks, co-channel interference (CCI) from neighboring cells degrades SINR. SINR = S / (I + N) determines achievable data rate via Shannon capacity.",
    implementation: [
      "Model hexagonal cellular network layout",
      "Implement H4 cascaded fading channel",
      "Compute SINR for multiple users",
      "Analyze spectral efficiency and outage probability"
    ],
    learningOutcomes: [
      "Cellular network architecture",
      "H4 fading channel characteristics",
      "SINR and capacity analysis",
      "System-level performance evaluation"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "cellular_h4.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment5_CellularNetwork.md", type: "Guide" }
    ]
  },
  {
    id: 6,
    slug: "assignment-6",
    title: "Water-filling Power Allocation Algorithm",
    shortDesc: "Implement optimal power allocation across multiple channels using the water-filling algorithm to maximize system capacity.",
    tags: ["Power Allocation", "Optimization", "Capacity Maximization"],
    objective: "Implement the water-filling algorithm for optimal power allocation across parallel channels to maximize total capacity.",
    theory: "Water-filling allocates more power to better channels: P_i = (μ - N0/|H_i|²)+ where μ is the water level determined by total power constraint. Total capacity: C = Σ log2(1 + P_i*|H_i|²/N0).",
    implementation: [
      "Generate multiple parallel channels with random gains",
      "Implement iterative water-filling algorithm",
      "Compare with equal power allocation",
      "Plot power allocation vs channel gain"
    ],
    learningOutcomes: [
      "Convex optimization in communications",
      "Water-filling theorem",
      "Capacity vs power trade-offs",
      "Multi-channel system design"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "water_filling.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment6_WaterFilling.md", type: "Guide" }
    ]
  },
  {
    id: 7,
    slug: "assignment-7",
    title: "MIMO Systems and Channel Capacity Analysis",
    shortDesc: "Explore Multiple Input Multiple Output systems, analyze channel capacity for different antenna configurations, and study BER performance.",
    tags: ["MIMO Systems", "Channel Capacity", "Spatial Diversity"],
    objective: "Implement MIMO channel models, compute capacity for various antenna configurations, and analyze BER with ZF and MMSE detectors.",
    theory: "MIMO capacity: C = log2(det(I + SNR/Nt * H*H^H)) where H is the channel matrix. Singular Value Decomposition decomposes MIMO into parallel SISO channels. ZF detector: W_ZF = (H^H*H)^(-1)*H^H eliminates inter-stream interference.",
    implementation: [
      "Generate random MIMO channel matrix H",
      "Compute channel capacity via SVD",
      "Implement ZF and MMSE detectors",
      "Plot BER vs SNR for different antenna configurations"
    ],
    learningOutcomes: [
      "MIMO channel modeling",
      "Spatial multiplexing and diversity",
      "Linear detection techniques",
      "Capacity scaling with antennas"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "mimo_capacity.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment7_MIMO.md", type: "Guide" }
    ]
  },
  {
    id: 8,
    slug: "assignment-8",
    title: "Diversity Combining Techniques",
    shortDesc: "Compare Selection Combining, Equal Gain Combining, and Maximum Ratio Combining. Analyze BER performance and diversity gains.",
    tags: ["Diversity Combining", "BER Analysis", "Fading Mitigation"],
    objective: "Implement and compare SC, EGC, and MRC diversity combining techniques under Rayleigh fading channels.",
    theory: "MRC maximizes SNR by weighting branches by their channel coefficients: y = Σ h_i* * r_i. SC selects the branch with highest SNR. EGC co-phases branches and sums equally. Diversity order d means BER ∝ SNR^(-d) at high SNR.",
    implementation: [
      "Simulate L-branch Rayleigh fading diversity system",
      "Implement SC, EGC, and MRC combiners",
      "Compute BER for BPSK under each scheme",
      "Plot BER vs SNR for L = 1, 2, 4 branches"
    ],
    learningOutcomes: [
      "Diversity gain concepts",
      "MRC optimality proof",
      "BER analysis under fading",
      "Trade-offs between combining techniques"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "diversity_combining.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment8_Diversity.md", type: "Guide" }
    ]
  },
  {
    id: 9,
    slug: "assignment-9",
    title: "Modulation Schemes and MIMO Techniques",
    shortDesc: "Implement BPSK, QPSK, and QAM modulation under SISO, SIMO, MISO, and MIMO configurations. Compare spectral efficiency and error performance.",
    tags: ["Digital Modulation", "MIMO Systems", "Alamouti STBC"],
    objective: "Implement various digital modulation schemes combined with SISO/SIMO/MISO/MIMO antenna configurations and analyze BER and spectral efficiency trade-offs.",
    theory: "Higher-order modulation (BPSK→QPSK→16QAM→64QAM) increases spectral efficiency but degrades BER. MIMO multiplexing gain = min(Nt, Nr) increases data rate. Diversity gain improves reliability. Fundamental trade-off: multiplexing gain + diversity gain ≤ Nt*Nr.",
    implementation: [
      "Implement BPSK, QPSK, 16-QAM modulators/demodulators",
      "Simulate SISO, SIMO, MISO, MIMO configurations",
      "Apply ML and ZF detection for MIMO",
      "Plot BER vs SNR for all modulation-antenna combinations"
    ],
    learningOutcomes: [
      "Modulation order vs BER vs spectral efficiency",
      "Antenna configuration trade-offs",
      "ML vs linear detection",
      "System design decision making"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "modulation_mimo.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment9_Modulation.md", type: "Guide" }
    ]
  },
  {
    id: 10,
    slug: "assignment-10",
    title: "Alamouti Space-Time Block Coding",
    shortDesc: "Implement Alamouti STBC using BPSK and QPSK. Compare normal MISO with Alamouti coding to understand transmit diversity benefits.",
    tags: ["Space-Time Coding", "Transmit Diversity", "Orthogonal Design"],
    objective: "Implement the Alamouti 2×1 STBC scheme and compare its BER performance against standard MISO transmission.",
    theory: "Alamouti code transmits [s1, s2] from antenna 1 and [-s2*, s1*] from antenna 2 in two consecutive symbol periods. At receiver: ỹ = H_eff * s + ñ where H_eff^H * H_eff = (|h1|²+|h2|²)*I ensuring orthogonal decoding without interference.",
    implementation: [
      "Implement Alamouti 2x1 STBC encoder and decoder",
      "Simulate over Rayleigh fading channel",
      "Compare BER with no-diversity MISO system",
      "Test with BPSK and QPSK modulation"
    ],
    learningOutcomes: [
      "Space-time block code design principles",
      "Full diversity with low complexity decoding",
      "Orthogonal STBC properties",
      "Transmit vs receive diversity comparison"
    ],
    files: [
      { label: "MATLAB Implementation", filename: "alamouti_stbc.m", type: "MATLAB" },
      { label: "Assignment Documentation", filename: "Assignment10_Alamouti.md", type: "Guide" }
    ]
  }
];
