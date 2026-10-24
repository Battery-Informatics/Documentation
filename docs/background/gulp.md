# GULP Setup

GULP is the external code that does the physics. XtalOpt generates candidate
structures but does not evaluate them itself: it writes an input file, hands it
to GULP, and reads back a relaxed structure and its energy. This page covers
what has to be configured for that handoff.

## Why GULP rather than DFT

GULP is a classical forcefield code. Energies come from parameterised
interatomic potentials rather than from solving the electronic structure, which
makes it seconds per structure instead of hours.

That difference decides whether the search is feasible at all. An evolutionary
run evaluates a hundred structures or more, each needing a full geometry
relaxation. At DFT cost that is a cluster job measured in days; at forcefield
cost it runs on a laptop.

The trade-off is accuracy. GULP ranks structures reliably enough to drive
selection — which is all the evolutionary algorithm needs — but its absolute
energies are not ab initio quality. The intended workflow is to search with
GULP and re-evaluate the shortlist with something more accurate.

## Ionic charges and the potential

Everything material-specific about the search lives in one block of the GULP
template. It has two parts: a formal charge for each species, and the pairwise
interactions between them.

```
species
Ti 2.196
O -1.098
buck
Ti Ti 31120.1 0.1540 5.25  15
O  O  11782.7 0.2340 30.22 15
Ti O  16957.5 0.1940 12.59 15
lennard 12 6
Ti Ti 1 0 15
O  O  1 0 15
Ti O  1 0 15
```

**`species` assigns the ionic charge per element.** These are the charges that
drive the electrostatic term, and they are what makes the model an *ionic*
description of the crystal — a cation/anion pair such as Ti⁴⁺/O²⁻ attracting,
like charges repelling. Note that the values need not be whole numbers:
`Ti 2.196` and `O -1.098` are partial charges, scaled down from formal valence
to account for the bonding not being purely ionic. The set must stay
charge-neutral over the composition.

**`buck` declares a Buckingham potential** for each pair of species. The three
numbers are the $A$, $\rho$ and $C$ parameters of

$$E(r) = A\exp\!\left(-\frac{r}{\rho}\right) - \frac{C}{r^6}$$

— a short-range repulsion that stops ions overlapping, and an attractive
dispersion term. The fourth value is the cutoff radius in Å.

**`lennard 12 6`** adds a Lennard-Jones term, here acting mainly to keep atoms
from collapsing onto one another at very short range.

Together, charges plus parameters *are* the chemistry. They are the only place
where the physics of this particular material enters the search. A wrong set
does not produce an error — it produces a run that completes normally and
reports energies that mean nothing, and every structure ranked, every hull
computed and every result downstream inherits that.

The parameters above are the stock TiO₂ set that ships with XtalOpt, used to
exercise the pipeline against a known-good forcefield while the MOME machinery
was being built. They are not the values for an NMC search.

<!-- TODO: substitute the validated Li-Ni-Mn-Co-O parameter set here, together
     with the ionic charges for Li, Ni, Mn, Co and O, and record their source.
     The NMC template currently on the composition-generator branch carries
     placeholder values and says so in a comment - round numbers chosen so the
     template parses, not a parameterised forcefield. -->

## The template

The potential block sits inside a template file that XtalOpt fills in per
structure. It does not write GULP input from scratch — it takes a skeleton and
substitutes values into it. The template lives at `templates/gulp/gin1`:

```
opti conj conp
switch_minimiser bfgs gnorm 0.5
cell
  %a% %b% %c% %alphaDeg% %betaDeg% %gammaDeg%
frac
%coordsFrac%
```

The `%...%` tokens are placeholders, replaced for every candidate:

| Placeholder | Substituted with |
|---|---|
| `%a%` `%b%` `%c%` | Lattice edge lengths |
| `%alphaDeg%` `%betaDeg%` `%gammaDeg%` | Lattice angles, in degrees |
| `%coordsFrac%` | One line per atom: species and fractional coordinates |

The first two lines are GULP directives rather than substitutions.
`opti conj conp` asks for a geometry optimisation at constant pressure, letting
both the atomic positions and the cell relax; `switch_minimiser bfgs gnorm 0.5`
switches the minimiser to BFGS once the gradient norm falls below 0.5.

The charges and potential described above follow directly underneath, constant
for the whole run.

## Configuration

The keys that point XtalOpt at GULP:

```
optimizer = gulp
templatesDirectory = ./templates/gulp
ginTemplates = gin1
numOptimizationSteps = 1
```

`numOptimizationSteps` is the number of successive relaxations applied to each
candidate. Multi-step schemes exist to go from a cheap coarse relaxation to an
expensive accurate one with DFT codes; with GULP a single step is enough, so
one template is listed.

Relaxed structures and GULP's output land under `localWorkingDirectory`, one
directory per structure. That is also where the descriptor scripts read from —
see [Descriptors](/implementation/descriptors).
