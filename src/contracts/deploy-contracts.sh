#!/bin/bash

trap ctrl_c INT
function ctrl_c() {
    exit
}

# ts-mocha --paths test/deploy/00*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/01*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/02*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/03*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/04*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/05*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/06*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/07*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/08*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/09*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/10*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/11*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/12*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/13*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/14*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/15*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/16*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/17*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/18*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/19*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/20*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/21*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/22*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/23*.spec.ts --bail --timeout 9000000 && \
# ts-mocha --paths test/deploy/24*.spec.ts --bail --timeout 9000000 && \
ts-mocha --paths test/deploy/x1*.spec.ts --bail --timeout 9000000
# ts-mocha --paths test/deploy/x2*.spec.ts --bail --timeout 9000000
