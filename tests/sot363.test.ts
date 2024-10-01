import test from "ava";
import { getTestFixture } from "tests/fixtures/get-test-fixture";

test("sot363", async (t) => {
  const { fp, logSoup, snapshotSoup } = await getTestFixture(t);
  const soup = fp.string("sot363").soup();

  await logSoup(soup);
  snapshotSoup(soup);
  t.pass();
});
