import * as github from '@actions/github'
import * as core from '@actions/core'
import * as _ from 'lodash'
import Octokit from '@octokit/rest'

const context = github.context

type CheckStatus = 'queued' | 'in_progress' | 'completed'

export async function wait(
  ghToken: string,
  namePattern: RegExp,
  includeQueued: boolean,
  waitMs: number
) {
  const octokit = new github.GitHub(ghToken)

  while (true) {
    await new Promise(resolve => setTimeout(resolve, waitMs))
    const awaiting = await getRunningChecksCount(
      octokit,
      namePattern,
      includeQueued ? ['completed', 'queued'] : ['completed']
    )
    if (awaiting <= 0) break

    console.log(`Awaiting ${awaiting} jobs to complete...`)
  }
}

export const getRunningChecksCount = async (
  octo: github.GitHub,
  namePattern: RegExp,
  status: CheckStatus[]
) => {
  const checks = await octo.checks.listForRef({
    ...context.repo,
    ref: context.ref
  })

  core.debug('Checks found:')
  core.debug(JSON.stringify(checks, null, 2))

  if (!checks.data) return 0

  return countMatchingChecks(checks.data.check_runs, namePattern, status)
}

export const countMatchingChecks = (
  checks: Octokit.ChecksListForRefResponseCheckRunsItem[],
  pattern: RegExp,
  status: CheckStatus[]
) =>
  _.filter(
    checks,
    c =>
      c.name !== context.workflow &&
      pattern.test(c.name) &&
      _.includes(status, c.status)
  ).length
