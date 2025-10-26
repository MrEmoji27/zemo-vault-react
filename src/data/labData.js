import { firstYear } from './1stYear';
import { secondYear } from './2ndYear';
import { thirdYear } from './3rdYear';
import { devOps } from './DevOps';

export const labData = {
  "1st Year": firstYear,
  "2nd Year": secondYear,
  "3rd Year": { ...thirdYear, "DevOps": devOps },
};
