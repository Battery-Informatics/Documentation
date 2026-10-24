# NMC Cathode Materials

This page covers the chemistry the project targets: what a cathode has to do, why
the materials in use today fall short, and why NMC-111 is our reference system.

## How a Li-ion cell stores energy

A lithium-ion cell stores energy by moving Li⁺ ions back and forth between two
electrodes. On discharge, Li⁺ leaves the anode, travels through the electrolyte,
and inserts into the cathode; electrons take the external circuit and do the
useful work. Charging reverses the process.

The cathode is the limiting half of that pair. It has to accept and release Li⁺
repeatedly without its atomic framework collapsing, which means the material's
**structure** matters as much as its **composition**. A transition-metal oxide
framework holds the lattice together and supplies the redox activity; oxygen
anions bind the framework; and the Li⁺ ions need a continuous, low-barrier path
through it.

This is why cathode improvement is a materials *design* problem rather than a
purely chemical one — the properties we want are consequences of atomic
arrangement, and arrangement is what crystal structure prediction searches over.

## Cathodes in use today, and their limits

| Material | Formula | Principal limitation |
|---|---|---|
| Lithium cobalt oxide | LiCoO₂ | Cobalt is expensive, scarce, and carries serious ethical and environmental mining concerns |
| Lithium iron phosphate | LiFePO₄ | Low operating voltage and low energy density per unit weight |
| Lithium manganese oxide | LiMn₂O₄ | Capacity fades quickly; manganese dissolution degrades the structure over cycles |

Across the board the recurring problems are:

- **Cost and scarcity** — heavy reliance on cobalt and nickel.
- **Limited capacity** — not enough charge stored per gram.
- **Degradation** — structural decay over repeated charge/discharge cycles.
- **Safety** — thermal instability at elevated temperature.

What a replacement needs to be: cheap and abundant, environmentally and
ethically sourceable, stable at higher temperatures, higher in energy per unit
weight, and fast to charge.

## NMC-111, the reference system

Our baseline material is **NMC-111**, lithium nickel manganese cobalt oxide in
equal transition-metal proportions:

$$\mathrm{LiNi_{0.33}Mn_{0.33}Co_{0.33}O_2}$$

![Render of the layered R-3m framework of LiCoO2: green lithium planes alternating with blue cobalt planes, bridged by red oxygen atoms](/images/LiCoO2.jpg)

*The layered R-3m framework, shown here for LiCoO₂ — the prototype of this
structural family. Green is lithium, blue cobalt, red oxygen; the stacking axis
runs along **c**. NMC-111 shares this framework, with nickel, manganese and
cobalt distributed over the single transition-metal site. Structure from
[Materials Project mp-22526][mp22526], rendered in VESTA.*

It adopts a **layered R-3m** structure. The significance of that space group
here is the stacking it implies:

- Li and transition-metal (Ni, Mn, Co) layers **alternate** along the stacking
  axis.
- Because the Li sits in its own distinct plane rather than being dispersed
  through the transition-metal framework, Li⁺ has a continuous two-dimensional
  path to diffuse along — this is what makes the material a good conductor of
  lithium.
- Oxygen occupies the planes between, holding the layers together.

The space group label itself (R-3m) is a statement about symmetry: it records
which rotations, reflections and inversions leave the crystal unchanged, and
therefore describes a highly ordered, regularly repeating arrangement.

The appeal of NMC is that the transition-metal ratio is tunable, so the
capacity, stability and cost balance can be shifted by changing the proportions
rather than the structure type.

For the simulation work, NMC-111 is used in supercell form — for example
`Li₁₂Ni₄Mn₄Co₄O₂₄` — which is the same chemistry in a larger simulation box.
The larger cell gives the evolutionary algorithm more atomic degrees of freedom
to explore while the composition stays fixed.

## What we ask of a candidate material

Structure alone is not the goal. A predicted structure is only interesting if it
performs, and performance is multi-dimensional:

**Specific capacity (mAh/g)** — how much charge one gram of the material can
hold. Higher capacity means more energy stored for the same weight, which is
what sets range in a vehicle or runtime in a device.

**Cell voltage (V)** — how strongly the cell drives electrons through the
circuit. Higher voltage means more power from the same amount of charge.

**Electrochemical reversibility** — whether the material can be charged and
discharged repeatedly without structural damage. This is what determines
cycle life.

**Elemental cost and abundance** — whether the material can be made at scale
without depending on scarce or problematic elements.

These pull against each other. Pushing capacity often costs stability; raising
voltage can accelerate degradation; removing cobalt saves cost but loses
structural ordering. There is no single best material, only a frontier of
trade-offs — which is precisely the argument for treating this as a
multi-objective, diversity-seeking search rather than a single-objective
minimisation. See [MOME / MAP-Elites](/background/moqd).

## The dopant substitution set

Beyond the fixed NMC-111 composition, the project searches **partial
substitution on the transition-metal site**, replacing cobalt with a candidate
dopant:

$$\mathrm{LiNiMn}X\mathrm{O_2}, \qquad X \in \{\mathrm{Co},\ \mathrm{Al},\ \mathrm{Fe},\ \mathrm{Nb}\}$$

The motivation is to remove cobalt. It is the scarcest and most expensive
component of NMC, it is toxic to handle, and its supply chain carries
well-documented human and environmental costs. Aluminium, iron and niobium are
the candidate replacements. Cobalt itself is kept in the set as the control,
since NMC-111 is the validated baseline.

Substituting the dopant changes the *element set* of the formula, not just the
proportions — and that distinction has a direct consequence for how the search
has to be configured, since stock XtalOpt accepts only one chemical system per
run.

::: info Status
The chemistry above defines the search space. For how the search is actually
set up and run over it, see [XtalOpt Architecture](/background/xtalopt) and the
Implementation section.
:::

## References

- *Utilizing machine
  learning to advance battery materials design: challenges and prospects*,
  Chemistry of Materials, **37**, 1759–1787, 2025.
  [DOI](https://doi.org/10.1021/acs.chemmater.4c03486)

## Figure sources

- **Layered R-3m framework** — LiCoO₂, [Materials Project mp-22526][mp22526];
  rendered locally in VESTA. Materials Project data is released under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

[mp22526]: https://next-gen.materialsproject.org/materials/mp-22526
