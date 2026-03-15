/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  Is,
  String,
  ExceptionHandler,
  type ExceptionHandlerContext
} from '@athenna/common'

import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'

export class CronExceptionHandler extends ExceptionHandler {
  /**
   * Error codes that should be ignored from logging.
   */
  public get ignoreCodes(): string[] {
    return Config.get('cron.logger.ignoreCodes', [])
  }

  /**
   * Error statuses that should be ignored from logging.
   */
  public get ignoreStatuses(): number[] {
    return Config.get('cron.logger.ignoreStatuses', [])
  }

  /**
   * The exception handler of all Artisan commands.
   */
  public async handle({ error }: ExceptionHandlerContext): Promise<void> {
    error.code = String.toSnakeCase(`${error.code}` || error.name).toUpperCase()

    if (!Is.Exception(error)) {
      error = error.toAthennaException()
    }

    if (!this.canBeLogged(error)) {
      return
    }

    if (Config.is('cron.logger.prettifyException', true)) {
      Log.channelOrVanilla('exception').error(await error.prettify())

      return
    }

    Log.channelOrVanilla('exception').error(error)
  }

  /**
   * Return a boolean indicating if the error can be logged or not.
   */
  private canBeLogged(error: any): boolean {
    if (this.ignoreCodes.includes(error.code)) {
      return false
    }

    if (this.ignoreStatuses.includes(error.status || error.statusCode)) {
      return false
    }

    return true
  }
}
