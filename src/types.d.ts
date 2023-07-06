interface IWorkspace {
  [key: string]: any
}

interface IOutput {
  [key: string]: Array<
    Array<{
      [key: string]: any
    }>
  >
  sentences: ISentence[][][]
}

interface IContext {
  sequences: any
}

interface ISource {
  content: string
  cv: string
  lemma: Array<string>
  morph: Array<string>
  occurence: number
  occurences: number
  strong: Array<string>
  id: string
}

interface ISentence {
  source: ISource[]
  sourceString: Array<{
    value: string
    gloss: string
  }>
}

interface ISentenceContext {
  fileName: string
  sentences: ISentence[][][]
  itemArrays: IChunk[][]
  curIndex: number
  setFileName: (name: string) => void
  setGlobalSentences: (index: number, sentence: ISentence[][]) => void
  setGlobalTotalSentences: (sentences: ISentence[][][]) => void
  setGlobalItemArrays: (index: number, itemArrays: IChunk[]) => void
  setCurIndex: (curIndex: number) => void
}

interface IChunk {
  chunk: {
    id: string
    content: string
  }[]
  gloss: string
}
