import github from '@actions/github'
import core from '@actions/core'
import * as _ from 'lodash'

const context = github.context

type CheckStatus = 'queued' | 'in_progress' | 'completed'

export async function wait(
  ghToken: string,
  names: Array<string | undefined>,
  includeQueued: boolean,
  waitMs: number
) {
  const octokit = new github.GitHub(ghToken)

  while (true) {
    const requests = _.flatMap(names, name =>
      includeQueued
        ? [
            getChecks(octokit, name, 'completed'),
            getChecks(octokit, name, 'queued')
          ]
        : getChecks(octokit, name, 'completed')
    )

    const res = await Promise.all(requests)
    const awaiting = _.sum(res)
    if (awaiting > 0) {
      console.log(`Awaiting ${awaiting} jobs to complete...`)
      await new Promise(resolve => setTimeout(resolve, waitMs))
    } else break
  }
}

const getChecks = async (
  octo: github.GitHub,
  check_name?: string,
  status?: CheckStatus
) =>
  (await octo.checks.listForRef({
    ...context.repo,
    ref: context.ref,
    check_name,
    status
  })).data.total_count
