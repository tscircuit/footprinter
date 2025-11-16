import { z } from "zod"
import { axial_def } from "src/fn/axial"
import { bga_def } from "src/fn/bga"
import { dfn_def } from "src/fn/dfn"
import { dip_def } from "src/fn/dip"
import { mlp_def } from "src/fn/mlp"
import { ms012_def } from "src/fn/ms012"
import { ms013_def } from "src/fn/ms013"
import { pinrow_def } from "src/fn/pinrow"
import { qfn_def } from "src/fn/qfn"
import { qfp_def } from "src/fn/qfp"
import { tqfp_def } from "src/fn/tqfp"
import { quad_def } from "src/fn/quad"
import { sod_def } from "src/fn/sod123"
import { soic_def } from "src/fn/soic"
import { sot23_def } from "src/fn/sot23"
import { sot363_def } from "src/fn/sot363"
import { sot886_def } from "src/fn/sot886"
import { sot563_def } from "src/fn/sot563"
import { sot723_def } from "src/fn/sot723"
import { ssop_def } from "src/fn/ssop"
import { tssop_def } from "src/fn/tssop"
import { passive_def } from "../passive-fn"
import { pad_def } from "../../fn/pad"
import { smtpad_def } from "../../fn/smtpad"

export const any_footprinter_def = z.union([
  axial_def,
  bga_def,
  dfn_def,
  dip_def,
  mlp_def,
  ms012_def,
  ms013_def,
  pinrow_def,
  qfn_def,
  tqfp_def,
  qfp_def,
  quad_def,
  sod_def,
  soic_def,
  sot23_def,
  sot363_def,
  sot886_def,
  sot563_def,
  sot723_def,
  ssop_def,
  tssop_def,
  passive_def,
  pad_def,
  smtpad_def,
])

export type AnyFootprinterDefinitionOutput = z.infer<typeof any_footprinter_def>
