import { wait, countMatchingChecks, getRunningChecksCount } from '../src/wait'
import Octokit = require('@octokit/rest')
import * as github from '@actions/github'

test('countMatchingChecks', () => {
  const checks: Partial<Octokit.ChecksListForRefResponseCheckRunsItem>[] = [
    {
      name: 'foo-1',
      status: 'queued'
    },
    {
      name: 'foo-2',
      status: 'in_progress'
    },
    {
      name: 'not-me',
      status: 'in_progress'
    },
    {
      name: 'foo-3',
      status: 'complete'
    }
  ]

  const count = countMatchingChecks(checks as any, /foo-\d/, [
    'queued',
    'in_progress'
  ])

  expect(count).toBe(2)
})

test('getChecks', async () => {
  const checks: Partial<Octokit.ChecksListForRefResponseCheckRunsItem>[] = [
    {
      name: 'foo-1',
      status: 'queued'
    },
    {
      name: 'foo-2',
      status: 'in_progress'
    },
    {
      name: 'not-me',
      status: 'in_progress'
    },
    {
      name: 'foo-3',
      status: 'complete'
    }
  ]
  const mockListForRef = jest
    .fn()
    .mockReturnValue(Promise.resolve({ data: { check_runs: checks } }))
  const octoMock = { checks: { listForRef: mockListForRef } }

  await expect(
    getRunningChecksCount(octoMock as any, /foo-\d/, ['queued', 'in_progress'])
  ).resolves.toBe(2)

  expect(mockListForRef.mock.calls.length).toBe(1)
  expect(mockListForRef.mock.calls[0][0]).toStrictEqual({
    ...github.context.repo,
    ref: github.context.ref
  })
})

test('wait until ', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  var delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})
