/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { StructureNode } from '@/types/ecrf-client'

/* eslint-disable no-plusplus */
export class ContentProcessor {
  static async processTitleContent(structure: StructureNode): Promise<number> {
    let sectionsCount = 0

    const processNode = (node: StructureNode) => {
      if (node.type === 'section') {
        sectionsCount++
      }

      if (node.children) {
        node.children.forEach(processNode)
      }
    }

    processNode(structure)
    return sectionsCount
  }

  static diffTexts(
    before: string,
    after: string
  ): {
    added: number
    removed: number
    changes: string[]
  } {
    const beforeWords = before.split(/\s+/)
    const afterWords = after.split(/\s+/)

    const changes: string[] = []
    let added = 0
    let removed = 0

    // Simple diff implementation
    const lcs = this.longestCommonSubsequence(beforeWords, afterWords)

    let i = 0
    let j = 0
    let k = 0
    while (i < beforeWords.length || j < afterWords.length) {
      if (k < lcs.length && beforeWords[i] === lcs[k] && afterWords[j] === lcs[k]) {
        i++
        j++
        k++
      } else if (j < afterWords.length && (k === lcs.length || afterWords[j] !== lcs[k])) {
        changes.push(`+ ${afterWords[j]}`)
        added++
        j++
      } else if (i < beforeWords.length && (k === lcs.length || beforeWords[i] !== lcs[k])) {
        changes.push(`- ${beforeWords[i]}`)
        removed++
        i++
      }
    }

    return { added, removed, changes }
  }

  private static longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
    const dp: number[][] = Array(arr1.length + 1)
      .fill(0)
      .map(() => Array(arr2.length + 1).fill(0))

    for (let i = 1; i <= arr1.length; i++) {
      for (let j = 1; j <= arr2.length; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i]![j] = dp[i - 1]![j - 1]! + 1
        } else {
          dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
        }
      }
    }

    const result: string[] = []
    let i = arr1.length
    let j = arr2.length
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        result.unshift(arr1[i - 1]!)
        i--
        j--
      } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
        i--
      } else {
        j--
      }
    }

    return result
  }
}
