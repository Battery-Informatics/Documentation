# Descriptors

Behaviour descriptors are what MOME uses to decide *where* a structure belongs.
They are the axes of the archive grid. This page covers how they are configured
and how descriptor support was added to XtalOpt, which had none.

## What a descriptor is

A descriptor is a measurable trait that characterises what kind of structure
something is, carrying no notion of better or worse. Density is a descriptor:
a structure is not good or bad for being dense, it simply is. An objective,
by contrast, has a direction — lower formation energy is better.

The split is the basis of the whole method, covered in
[MOME / MAP-Elites](/background/moqd):

> Descriptors choose where a structure is filed. Objectives choose whether it
> survives there.

We use two, since the archive is a two-dimensional grid:

| Descriptor | Range configured |
|---|---|
| Density | 0.0 – 5.0 |
| Bandgap | 0.0 – 10.0 |

Both are deliberately generic structural and electronic properties rather than
cathode-specific ones, so the search is not biased toward a particular
structural assumption.

## Configuration

A descriptor is declared with a single input line taking five fields:

```
descriptor = <name> <executable> <output_file> <min> <max>
```

As used in our runs:

```
descriptor = density ./calc_density.sh density.out 0.0 5.0
descriptor = bandgap ./calc_bandgap.py gap.out   0.0 10.0
```

| Field | Meaning |
|---|---|
| `name` | Label for the descriptor, used in logs and output |
| `executable` | Script XtalOpt runs for each structure |
| `output_file` | File the script writes its single numeric result to |
| `min` / `max` | Bounds of this descriptor's grid axis |

The bounds are not a filter — they define the span of the archive axis, and so
determine what each bin covers. They have no sensible default and must be set
per descriptor.

Input is rejected at parse time if the line does not have exactly five fields,
if the name is empty, if the output filename is invalid, if the bounds are not
finite numbers, or if `min >= max`. A separate check enforces that a MOME run
has **exactly two** descriptors configured, since the grid has two axes; the
run is refused with a message naming the count it found.

## How the descriptors are calculated

Each descriptor is computed by an external script, not inside XtalOpt. Before
running them, XtalOpt writes the relaxed structure to `output.POSCAR` in the
structure's working directory and copies it to the execution host. Each script
reads that file, computes its value, and writes a single number to its declared
output file. XtalOpt reads the number back.

This mirrors how XtalOpt already handles user-defined objectives and
constraints, so descriptors slot into the existing external-script machinery
rather than introducing a second mechanism. It also means a new descriptor
needs no C++ changes — a script and one config line are enough.

## How it was added to XtalOpt

Stock XtalOpt has objectives and constraints but no concept of a behaviour
descriptor. Support was added in four places, each following the pattern the
existing objective code already established.

**A descriptor definition type.** `SearchBase::DescriptorInfo` holds the five
configured fields — `name`, `exe`, `out`, `min`, `max` — and the search keeps a
`QList<DescriptorInfo>`. Accessors mirror the objective ones:
`getDescriptorsNum()`, `getDescriptorName(i)`, `getDescriptorMin(i)` and so on.

**Per-structure storage.** `Structure` gained a list of computed descriptor
values plus a state enum tracking whether they have been calculated:

| State | Meaning |
|---|---|
| `Ds_NotCalculated` | Not yet run |
| `Ds_Retain` | Computed successfully, values held |
| `Ds_Fail` | The script failed or its output could not be read |

**A new stage in the queue manager's state machine.** Structures move through
a sequence of states as they are optimised and evaluated; a
`DescriptorCalculation` state was added alongside the existing objective and
constraint calculation states. Descriptors are computed **after** constraints
and objectives have passed — there is no point characterising a structure that
has already been rejected.

**Execution and readback.** `startDescriptorCalculations()` writes
`output.POSCAR`, copies it where the scripts will run, and launches them.
`finishDescriptorCalculations()` collects the outputs, reads one value per
descriptor, and records them on the structure. If any script fails to produce a
readable value, the structure is marked `Ds_Fail` and does not enter the
archive.

**Handoff to the archive.** Once descriptors are finalised,
`insertIntoMomeArchiveIfReady()` passes them to the archive along with the
structure's objective values. It is a no-op unless MOME is the active
optimisation type, the descriptor state is `Ds_Retain`, and exactly two values
are present. What happens next — mapping values to a cell and testing for
non-dominance — is covered in [Grid Archive](/implementation/archive).

## Current limitations

**Exactly two descriptors.** The archive is a fixed two-dimensional grid, so a
MOME run requires two and refuses any other count. Supporting higher-dimensional
behaviour spaces would mean generalising the grid.

**Bounds are manual.** There is no auto-scaling or adaptive range. If the
bounds are set badly the archive is wasted — too wide and every structure lands
in a handful of central bins, too narrow and structures fall outside the range
entirely. Values outside `[min, max]` are rejected rather than clamped, so a
poorly chosen range silently discards candidates.

**No built-in descriptors.** Every descriptor is an external script. This keeps
the mechanism flexible, but it means descriptor evaluation cost is added to
every structure that survives to that stage, and a crashing script is an opaque
`Ds_Fail` rather than a diagnosable error.

<!-- TODO: density and bandgap were chosen as generic, non-committal
     descriptors while the pipeline was being validated. Decide whether they
     are the right behaviour axes for cathode discovery, as against something
     more directly tied to Li-ion transport. -->
