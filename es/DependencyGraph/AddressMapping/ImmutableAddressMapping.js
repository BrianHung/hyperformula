/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { NoSheetWithIdError } from '../../errors';
import { EmptyValue } from '../../interpreter/InterpreterValue';
import { ArrayVertex, ValueCellVertex } from '../index';
import { AddressMapping } from '../index';
export class ImmutableAddressMapping extends AddressMapping {
  constructor(policy, immutableMapping) {
    super(policy);
    this.policy = policy;
    this.immutableMapping = immutableMapping;
  }
  getCellId(address) {
    return this.getCell(address).id;
  }
  setCellId(address, id) {
    const vertex = this.getCell(address);
    if (vertex) vertex.id = id;
  }
  getColId(address) {
    return this.immutableMapping.getColId(address);
  }
  getRowId(address) {
    return this.immutableMapping.getRowId(address);
  }
  /** @inheritDoc */
  getCell(address) {
    const sheetMapping = this.mapping.get(address.sheet);
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(address.sheet);
    }
    return sheetMapping.getCell(address);
  }
  fetchCell(address) {
    const sheetMapping = this.mapping.get(address.sheet);
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(address.sheet);
    }
    const vertex = sheetMapping.getCell(address);
    if (!vertex) {
      throw Error('Vertex for address missing in AddressMapping');
    }
    return vertex;
  }
  addSheet(sheetId, strategy) {
    if (this.mapping.has(sheetId)) {
      throw Error('Sheet already added');
    }
    this.mapping.set(sheetId, strategy);
  }
  autoAddSheet(sheetId, sheetBoundaries) {
    const {
      height,
      width,
      fill
    } = sheetBoundaries;
    const strategyConstructor = this.policy.call(fill);
    this.addSheet(sheetId, new strategyConstructor(width, height));
  }
  getCellValue(address) {
    const vertex = this.getCell(address);
    if (vertex === undefined) {
      return EmptyValue;
    } else if (vertex instanceof ArrayVertex) {
      return vertex.getArrayCellValue(address);
    } else {
      return vertex.getCellValue();
    }
  }
  getRawValue(address) {
    const vertex = this.getCell(address);
    if (vertex instanceof ValueCellVertex) {
      return vertex.getValues().rawValue;
    } else if (vertex instanceof ArrayVertex) {
      return vertex.getArrayCellRawValue(address);
    } else {
      return null;
    }
  }
  /** @inheritDoc */
  setCell(address, newVertex) {
    const sheetMapping = this.mapping.get(address.sheet);
    if (!sheetMapping) {
      throw Error('Sheet not initialized');
    }
    // PERF: Optimize this using LazilyTransformingAstService version
    if (newVertex.id === undefined) newVertex.id = this.immutableMapping.getCellId(address);
    sheetMapping.setCell(address, newVertex);
  }
  moveCell(source, destination) {
    const sheetMapping = this.mapping.get(source.sheet);
    if (!sheetMapping) {
      throw Error('Sheet not initialized.');
    }
    if (source.sheet !== destination.sheet) {
      throw Error('Cannot move cells between sheets.');
    }
    if (sheetMapping.has(destination)) {
      throw new Error('Cannot move cell. Destination already occupied.');
    }
    const vertex = sheetMapping.getCell(source);
    if (vertex === undefined) {
      throw new Error('Cannot move cell. No cell with such address.');
    }
    this.setCell(destination, vertex);
    this.removeCell(source);
  }
  removeCell(address) {
    const sheetMapping = this.mapping.get(address.sheet);
    if (!sheetMapping) {
      throw Error('Sheet not initialized');
    }
    sheetMapping.removeCell(address);
  }
  /** @inheritDoc */
  has(address) {
    const sheetMapping = this.mapping.get(address.sheet);
    if (sheetMapping === undefined) {
      return false;
    }
    return sheetMapping.has(address);
  }
  /** @inheritDoc */
  getHeight(sheetId) {
    const sheetMapping = this.mapping.get(sheetId);
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheetId);
    }
    return sheetMapping.getHeight();
  }
  /** @inheritDoc */
  getWidth(sheetId) {
    const sheetMapping = this.mapping.get(sheetId);
    if (!sheetMapping) {
      throw new NoSheetWithIdError(sheetId);
    }
    return sheetMapping.getWidth();
  }
  addRows(sheet, row, numberOfRows) {
    const sheetMapping = this.mapping.get(sheet);
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheet);
    }
    sheetMapping.addRows(row, numberOfRows);
  }
  removeRows(removedRows) {
    const sheetMapping = this.mapping.get(removedRows.sheet);
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(removedRows.sheet);
    }
    sheetMapping.removeRows(removedRows);
  }
  removeSheet(sheetId) {
    this.mapping.delete(sheetId);
  }
  addColumns(sheet, column, numberOfColumns) {
    const sheetMapping = this.mapping.get(sheet);
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheet);
    }
    sheetMapping.addColumns(column, numberOfColumns);
  }
  removeColumns(removedColumns) {
    const sheetMapping = this.mapping.get(removedColumns.sheet);
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(removedColumns.sheet);
    }
    sheetMapping.removeColumns(removedColumns);
  }
}