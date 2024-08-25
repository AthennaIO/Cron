/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { debug } from '#src/debug'
import { Options } from '@athenna/common'
import { Annotation } from '@athenna/ioc'
import type { SchedulerOptions } from '#src/types/schedulers/SchedulerOptions'

/**
 * Create a scheduler inside the service provider.
 */
export function Scheduler(options: SchedulerOptions): ClassDecorator {
  return (target: any) => {
    options = Options.create(options, {
      name: target.name,
      scheduled: true,
      runOnInit: false,
      recoverMissedExecutions: false,
      alias: `App/Cron/Schedulers/${target.name}`,
      type: 'transient'
    })

    debug('Registering scheduler metadata for the service container %o', {
      name: target.name,
      ...options
    })

    if (
      ioc.has(options.alias) ||
      ioc.has(options.camelAlias) ||
      ioc.has(options.name)
    ) {
      debug('Skipping registration, scheduler is already registered.')

      return
    }

    Annotation.defineMeta(target, options)
  }
}
