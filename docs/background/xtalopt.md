# XtalOpt Architecture

XtalOpt is the evolutionary crystal structure prediction code this project
builds on. This page covers what a crystal structure is, why prediction is hard,
how XtalOpt represents and evolves structures, and where it differs from USPEX.

## Crystal structure 101

A crystal is a periodic arrangement of atoms. The **unit cell** is the smallest
repeating block; tiling it infinitely in three dimensions reconstructs the whole
crystal. So describing a crystal means describing one cell.

That takes two things:

**The container** — six lattice parameters. Three edge lengths $a$, $b$, $c$ and
three angles $\alpha$, $\beta$, $\gamma$ define the parallelepiped that repeats.

**The contents** — where the atoms sit inside it. Positions are given as
*fractional coordinates*, each in $[0, 1)$, expressed as a proportion along each
cell edge rather than in absolute distance. This keeps the description
independent of cell size.

![A unit cell drawn as a parallelepiped, with edge vectors a, b and c meeting at one corner, the angles alpha, beta and gamma between them, and the x, y, z reference axes](/images/unitcell.gif)

*The unit cell. Three edge lengths $a$, $b$, $c$ and the three angles between
them — $\gamma$ between $a$ and $b$, $\beta$ between $a$ and $c$, $\alpha$
between $b$ and $c$ — define the container. The atoms inside it, placed at
fractional coordinates, are the contents. Figure from
[DoITPoMS][doitpoms], University of Cambridge.*

## Why structure prediction is the problem

A material is defined by both what atoms are present and how they are arranged.
Arrangement alone can change everything: carbon in one arrangement is graphite,
soft enough to write with; in another it is diamond.

Crystal structure prediction (CSP) asks the resulting question — **given a set
of atoms, how do they arrange themselves into a stable structure?** Only a small
number of stable arrangements are known. A new, physically realisable stable
structure is, in effect, a new material.

The search is hard because of scale. There are thousands of plausible
compositions, and for each one a continuous space of possible atomic
arrangements. Exhaustive enumeration is out of the question, and the
experimental alternative is worse: a single material takes months to synthesise
and test, and most attempts turn out to be unstable.

This makes it an optimisation problem over a space that is high-dimensional,
non-convex, discontinuous, and heavily constrained — the conditions under which
evolutionary algorithms do well.

## Representation

XtalOpt evolves structures directly in their natural crystallographic form. A
structure's genome is the six lattice parameters plus the fractional coordinates
of its atoms:

$$6 + 3(N-1)$$

for $N$ atoms — six for the cell, three per atom, less three because fixing the
origin removes a redundant translational degree of freedom. This is enough to
reconstruct the full three-dimensional crystal.

Representing crystals this way is a deliberate choice. The variation operators
can then be **domain-aware**: they manipulate lattices and atomic positions as
physical objects, so an operator can be written to respect the geometry rather
than scrambling an abstract bit string.

## Genetic operators

XtalOpt generates offspring with five operators. Which ones are available
depends on the search type — the last two change composition, so they only apply
to variable-composition runs.

| Operator | What it does |
|---|---|
| **Crossover** | Cuts two parent cells into slabs and splices them, combining spatial fragments of both |
| **Stripple** | Applies a periodic (ripple) displacement to atomic coordinates together with a lattice strain |
| **Permustrain** | Swaps atoms of different species and strains the cell |
| **Permutomic** | Swaps atomic species — changes which element sits where |
| **Permucomp** | Permutes the composition itself, changing the stoichiometry |

Each is applied with a configurable relative weight. Random structure injection
is also used during the initial phase to seed the population and to maintain
exploration.

::: info Figure pending
`operators.png` — a small panel showing crossover (two cells cut and spliced)
and stripple (a cell before and after the ripple displacement). Only worth
including if it can be drawn clearly at small size.
:::

## The search loop

The pipeline below is one pass of the evolutionary loop. It runs continuously:
the queue manager keeps a target number of structures in flight, and every time
a slot opens a new candidate is generated.

![The XtalOpt variable-composition multi-objective workflow: sample an initial population from preselected compositions, relax the structures with an external code, evaluate objectives, compute the convex hull, select parents by Pareto optimisation or scalar fitness, apply genetic operations to generate new structures, and relax again](/images/xtalopt-flow.png)

*The XtalOpt search loop, as described by its authors. Figure from the
[XtalOpt project][xtalopt-site], Zurek Lab, University at Buffalo.*

The stages, in order:

**Sample the initial population.** The run starts from a set of preselected
compositions — in a variable-composition search these are points in the
composition simplex, the triangle shown at the left of the figure. Structures
for them are generated at random, optionally with imposed symmetry so that
candidates are chemically sensible rather than arbitrary point clouds. Before a
candidate is accepted it is checked for physical plausibility, principally that
no two atoms sit closer than their combined covalent radii allow.

**Relax the structures.** XtalOpt does not compute energies itself. It writes
input files for an external code — GULP, VASP, CASTEP, Quantum ESPRESSO,
SIESTA, LAMMPS, MTP and others — and submits the job through a queue interface,
local or remote. The external code relaxes the structure to a nearby local
minimum and returns the energy.

**Evaluate objectives.** Beyond energy, user-defined objectives can be computed
by external tools and attached to the structure. This is the hook our voltage
objective uses.

**Compute the convex hull.** For variable-composition searches, stability is
measured as distance above the convex hull of formation energies rather than by
raw enthalpy, so that structures of different compositions can be compared.

**Select parents.** Survivors are ranked and a parent pool is drawn from them,
either by scalar fitness or by Pareto optimisation when several objectives are
active. **This is the stage our work replaces** — see
[MOME / MAP-Elites](/background/moqd).

**Apply genetic operations.** The operators above produce offspring from the
selected parents, and the loop returns to relaxation.

Not shown in the figure, but present in the code, is the **similarity filter**.
Relaxation tends to funnel different starting structures into the same minimum,
so duplicates are detected — by XtalComp, plus an RDF fingerprint comparison —
and marked, keeping the population from collapsing onto one answer.

## XtalOpt and USPEX

Both are evolutionary CSP codes and both work the same way in outline. USPEX is
the older and more established of the two, with a longer record of experimental
confirmations — predicted uranium hydride phases later verified in the lab, and
the mineral zaccariniite recovered in sixteen generations without prior
structural data.

The relevant difference for us is access.

| | USPEX | XtalOpt |
|---|---|---|
| Licence | Proprietary, closed source | Open source |
| Implementation | — | C++ / Qt |
| Operators | Fixed | Modifiable |
| Extension | Not possible | Scripts and custom modules |
| Maturity | More advanced modules | Fewer; built for experimentation |

USPEX cannot be modified, so the evolutionary operators cannot be changed,
cathode-specific structural constraints cannot be injected, and a
quality-diversity archive cannot be added. XtalOpt can be extended on all three
counts, which is why it is the base system here even though USPEX is the more
mature code. XtalOpt has its own record — it predicted a previously unknown
structure for Mg₃BN₃.

What XtalOpt does *not* provide, and what this project adds, is covered in the
Implementation section: a behaviour-space archive in place of Pareto selection
(see [MOME / MAP-Elites](/background/moqd)), and composition input that can
express dopant substitution across chemical systems.

## References

- Glass, C. W., Oganov, A. R., & Hansen, N. — *USPEX — Evolutionary crystal
  structure prediction*, Computer Physics Communications, **175**, 713–720,
  2006. [DOI](https://doi.org/10.1016/j.cpc.2006.07.020)
- Lyakhov, A. O., Oganov, A. R., Stokes, H. T., & Zhu, Q. — *New developments in
  evolutionary structure prediction algorithm USPEX*, Computer Physics
  Communications, **184**, 1172–1182, 2013.
  [DOI](https://doi.org/10.1016/j.cpc.2012.12.009)
- Falls, Z., Lonie, D. C., Avery, P., Shamp, A., & Zurek, E. — *The XtalOpt
  evolutionary algorithm for crystal structure prediction*, The Journal of
  Physical Chemistry C, **125**, 1601–1620, 2021.
  [DOI](https://doi.org/10.1021/acs.jpcc.0c09531)

## Figure sources

- **Unit cell** — [DoITPoMS, University of Cambridge][doitpoms]. DoITPoMS
  teaching resources are released under a Creative Commons
  Attribution-NonCommercial-ShareAlike licence.
- **XtalOpt workflow** — [XtalOpt project][xtalopt-site], Zurek Lab, University
  at Buffalo. Reproduced with credit to the XtalOpt authors; see also Falls et
  al. (2021), referenced above.

[doitpoms]: https://www.doitpoms.ac.uk/tlplib/crystallography3/parameters.php
[xtalopt-site]: https://xtalopt.github.io/
