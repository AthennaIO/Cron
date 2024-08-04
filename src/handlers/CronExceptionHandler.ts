/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'
import { Is, String } from '@athenna/common'

export class CronExceptionHandler {
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
  public async handle(error: any): Promise<void> {
    error.code = String.toSnakeCase(error.code || error.name).toUpperCase()

    const isException = Is.Exception(error)
    const isDebugMode = Config.get('app.debug', true)
    const isInternalServerError = Is.Error(error) && !isException

    if (!isException) {
      error = error.toAthennaException()
    }

    if (isInternalServerError && !isDebugMode) {
      error.name = 'Internal error'
      error.code = 'E_INTERNAL_ERROR'
      error.message = 'An internal error has occurred.'

      delete error.stack
    }

    if (!this.canBeLogged(error)) {
      return
    }

    Log.channelOrVanilla('exception').error(await error.prettify())
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
