/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, File } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeSchedulerCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateASchedulerFile({ assert, command }: Context) {
    const output = await command.run('make:scheduler TestScheduler')

    output.assertSucceeded()
    output.assertLogged('[ MAKING SCHEDULER ]')
    output.assertLogged('[  success  ] Scheduler "TestScheduler" successfully created.')
    output.assertLogged('[  success  ] Athenna RC updated: [ schedulers += "#app/cron/schedulers/TestScheduler" ]')

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.schedulers('TestScheduler.ts')))
    assert.containsSubset(athenna.schedulers, ['#app/cron/schedulers/TestScheduler'])
  }

  @Test()
  public async shouldBeAbleToCreateASchedulerFileWithADifferentDestPathAndImportPath({ assert, command }: Context) {
    const output = await command.run('make:scheduler TestScheduler', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING SCHEDULER ]')
    output.assertLogged('[  success  ] Scheduler "TestScheduler" successfully created.')
    output.assertLogged(
      '[  success  ] Athenna RC updated: [ schedulers += "#tests/fixtures/storage/schedulers/TestScheduler" ]'
    )

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.isTrue(await File.exists(Path.fixtures('storage/schedulers/TestScheduler.ts')))
    assert.containsSubset(athenna.schedulers, ['#tests/fixtures/storage/schedulers/TestScheduler'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:scheduler TestScheduler')
    const output = await command.run('make:scheduler TestScheduler')

    output.assertFailed()
    output.assertLogged('[ MAKING SCHEDULER ]')
    output.assertLogged('The file')
    output.assertLogged('TestScheduler.ts')
    output.assertLogged('already exists')
  }
}
