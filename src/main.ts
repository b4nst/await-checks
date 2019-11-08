import * as core from '@actions/core'
import { wait } from './wait'

async function run() {
  try {
    const name = core.getInput('name_pattern')
    const token = core.getInput('github_token')
    const includeQueue = core.getInput('include_queue')
    const waitMs = core.getInput('wait_ms')

    await wait(
      token,
      new RegExp(name),
      includeQueue === 'true',
      parseInt(waitMs, 10)
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
