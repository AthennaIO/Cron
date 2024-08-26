/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TestContext } from '@japa/runner/core'
import { TestScheduler } from '#src/testing/plugins/scheduler/TestScheduler'

declare module '@japa/runner/core' {
  interface TestContext {
    scheduler: TestScheduler
  }
}

export * from '#src/testing/plugins/scheduler/TestScheduler'

/**
 * Scheduler plugin registers the scheduler macro to the test context.
 */
export function scheduler() {
  return function () {
    TestContext.macro('scheduler', new TestScheduler())
  }
}
