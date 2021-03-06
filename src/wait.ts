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
    console.log('Count jobs with name', namePattern)
    const awaiting = await getRunningChecksCount(
      octokit,
      namePattern,
      includeQueued ? ['completed', 'queued'] : ['completed']
    )
    console.log('Found', awaiting, 'jobs')
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

  console.log('Checks found:', _.map(checks, _.property('name')))

  if (!checks.data) return 0

  return countMatchingChecks(checks.data.check_runs, namePattern, status)
}

export const countMatchingChecks = (
  checks: Octokit.ChecksListForRefResponseCheckRunsItem[],
  pattern: RegExp,
  status: CheckStatus[]
) =>
  _.filter(checks, c => {
    const isNotSameJob = c.name !== context.workflow
    const matchPattern = pattern.test(c.name)
    const includeStatus = _.includes(status, c.status)
    console.log(
      c.name,
      context.workflow,
      isNotSameJob,
      pattern,
      matchPattern,
      c.status,
      includeStatus
    )
    return isNotSameJob && matchPattern && includeStatus
  }).length
