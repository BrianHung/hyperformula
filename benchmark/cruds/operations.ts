import {HandsOnEngine} from '../../src'
import { StatType} from '../../src/statistics/Statistics'

export function addColumns(engine: HandsOnEngine, stats: any[]) {
  let dimensions = getDimensions(engine)
  measure(engine, stats, 'Add column at the beginning', () => engine.addColumns(0, 0, 1))
  dimensions = getDimensions(engine)
  measure(engine, stats, 'Add column in the middle   ', () => engine.addColumns(0, half(dimensions.width), 1))
  dimensions = getDimensions(engine)
  measure(engine, stats, 'Add column at the end      ', () => engine.addColumns(0, dimensions.width - 1, 1))
}

export function addRows(engine: HandsOnEngine, stats: any[]) {
  let dimensions = getDimensions(engine)
  measure(engine, stats, 'Add row at the beginning', () => engine.addRows(0, 0, 1))
  dimensions = getDimensions(engine)
  measure(engine, stats, 'Add row in the middle   ', () => engine.addRows(0, half(dimensions.height), 1))
  dimensions = getDimensions(engine)
  measure(engine, stats, 'Add row at the end      ', () => engine.addRows(0, dimensions.height - 1, 1))
}

export function removeColumns(engine: HandsOnEngine, stats: any[]) {
  let dimensions = getDimensions(engine)
  measure(engine, stats, 'Remove column at the beginning', () => engine.removeColumns(0, 0, 0))
  dimensions = getDimensions(engine)
  measure(engine, stats, 'Remove column in the middle   ', () => engine.removeColumns(0, half(dimensions.width), half(dimensions.width)))
  dimensions = getDimensions(engine)
  measure(engine, stats, 'Remove column at the end      ', () => engine.removeColumns(0, dimensions.width - 1, dimensions.width - 1))
}

export function removeRows(engine: HandsOnEngine, stats: any[]) {
  let dimensions = getDimensions(engine)
  measure(engine, stats, 'Remove row at the beginning', () => engine.removeRows(0, 0, 0))
  dimensions = getDimensions(engine)
  measure(engine, stats, 'Remove row in the middle   ', () => engine.removeRows(0, half(dimensions.height), half(dimensions.height)))
  dimensions = getDimensions(engine)
  measure(engine, stats, 'Remove row at the end      ', () => engine.removeRows(0, dimensions.height - 1, dimensions.height - 1))
}

export function batch(engine: HandsOnEngine) {
  const stats: any[] = []
  addRows(engine, stats)
  addColumns(engine, stats)
  removeRows(engine, stats)
  removeColumns(engine, stats)
  logStats(stats)
}

export function half(num: number) {
  return Math.floor(num / 2)
}

export function getDimensions(engine: HandsOnEngine) {
  return engine.getSheetsDimensions().get('Sheet1')!
}

export function measure<T>(engine: HandsOnEngine, stats: any[], name: String, func: () => T) {
  const start = Date.now()
  func()
  const end = Date.now()
  const time = end - start
  const actualStats = engine.getStats() as Map<string, any>
  actualStats.set('TOTAL', time)
  actualStats.set('NAME', name)
  stats.push(statsToObject(actualStats))
}

export function statsToObject(stats: Map<string, any>) {
  return Object.assign({}, ...[...stats.entries()].map(([k, v]) => ({[k]: v})))
}

export function logStats(stats: any[]) {
  console.table(stats, ['NAME', 'TOTAL', ...Object.keys(StatType)])
}