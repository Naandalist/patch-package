import { runIntegrationTest } from "../runIntegrationTest"
runIntegrationTest({
  projectName: "unexpected-patch-creation-failure",
  exitCode: 1,
  shouldProduceSnapshots: false,
})
