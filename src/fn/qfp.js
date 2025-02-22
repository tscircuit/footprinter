import { quad, quad_def } from "./quad";
export const qfp_def = quad_def;
export const qfp = (raw_params) => {
    raw_params.legsoutside = true;
    const quad_defaults = quad_def.parse(raw_params);
    if (!raw_params.p) {
        switch (raw_params.num_pins) {
            case 44:
            case 64:
                raw_params.p = 0.8;
                break;
            case 52:
                if (raw_params.w === 14)
                    raw_params.p = 1;
                else
                    raw_params.p = 0.65;
                break;
            case 208:
                raw_params.p = 0.5;
                break;
        }
    }
    if (!raw_params.pl) {
        switch (raw_params.num_pins) {
            case 44:
            case 52:
            case 64:
                raw_params.pl = 2.25;
                break;
            case 208:
                raw_params.pl = 1.65;
                break;
            default:
                raw_params.pl = quad_defaults.pl * 4;
                break;
        }
    }
    if (!raw_params.pw) {
        switch (raw_params.num_pins) {
            case 44:
            case 64:
                raw_params.pw = 0.5;
                break;
            case 52:
                if (raw_params.w === 14)
                    raw_params.pw = 0.45;
                else
                    raw_params.pw = 0.55;
                break;
            case 208:
                raw_params.pw = 0.3;
                break;
            default:
                raw_params.pw = quad_defaults.pw;
                break;
        }
    }
    return quad(raw_params);
};
