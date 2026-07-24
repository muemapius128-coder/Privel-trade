import { Injectable } from '@nestjs/common';

export enum ParameterType {
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
}

export interface ParameterDefinition {
  name: string;

  type: ParameterType;

  min?: number;

  max?: number;

  step?: number;

  values?: any[];

  defaultValue?: any;

  required?: boolean;
}

export interface ParameterSet {
  [key: string]: any;
}

@Injectable()
export class ParameterOptimizer {
  /**
   * Generate all possible parameter combinations.
   */
  generate(
    definitions: ParameterDefinition[],
  ): ParameterSet[] {
    const valueMatrix = definitions.map(
      definition => ({
        name: definition.name,
        values: this.generateValues(definition),
      }),
    );

    return this.cartesianProduct(valueMatrix);
  }

  /**
   * Generate random parameter combinations.
   */
  generateRandom(
    definitions: ParameterDefinition[],
    count: number,
  ): ParameterSet[] {
    const results: ParameterSet[] = [];

    for (let i = 0; i < count; i++) {
      const candidate: ParameterSet = {};

      for (const definition of definitions) {
        candidate[definition.name] =
          this.randomValue(definition);
      }

      results.push(candidate);
    }

    return results;
  }

  /**
   * Validate a parameter set.
   */
  validate(
    parameters: ParameterSet,
    definitions: ParameterDefinition[],
  ): boolean {
    for (const definition of definitions) {
      const value = parameters[definition.name];

      if (
        definition.required &&
        value === undefined
      ) {
        return false;
      }

      if (
        value !== undefined &&
        !this.isValidValue(value, definition)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create default parameter set.
   */
  defaults(
    definitions: ParameterDefinition[],
  ): ParameterSet {
    const defaults: ParameterSet = {};

    for (const definition of definitions) {
      defaults[definition.name] =
        definition.defaultValue;
    }

    return defaults;
  }

  /**
   * Generate values for a single parameter.
   */
  private generateValues(
    definition: ParameterDefinition,
  ): any[] {
    switch (definition.type) {
      case ParameterType.INTEGER:
      case ParameterType.FLOAT:
        return this.generateNumericValues(
          definition,
        );

      case ParameterType.BOOLEAN:
        return [true, false];

      case ParameterType.ENUM:
        return definition.values ?? [];

      default:
        return [];
    }
  }

  /**
   * Generate numeric sequence.
   */
  private generateNumericValues(
    definition: ParameterDefinition,
  ): number[] {
    const values: number[] = [];

    const min = definition.min ?? 0;
    const max = definition.max ?? 0;
    const step = definition.step ?? 1;

    for (
      let value = min;
      value <= max;
      value += step
    ) {
      values.push(
        definition.type === ParameterType.INTEGER
          ? Math.round(value)
          : Number(value.toFixed(8)),
      );
    }

    return values;
  }

  /**
   * Generate a random value.
   */
  private randomValue(
    definition: ParameterDefinition,
  ): any {
    switch (definition.type) {
      case ParameterType.INTEGER: {
        const min = definition.min ?? 0;
        const max = definition.max ?? 0;

        return (
          Math.floor(
            Math.random() *
              (max - min + 1),
          ) + min
        );
      }

      case ParameterType.FLOAT: {
        const min = definition.min ?? 0;
        const max = definition.max ?? 1;

        return (
          Math.random() *
            (max - min) +
          min
        );
      }

      case ParameterType.BOOLEAN:
        return Math.random() >= 0.5;

      case ParameterType.ENUM: {
        const values =
          definition.values ?? [];

        return values[
          Math.floor(
            Math.random() *
              values.length,
          )
        ];
      }

      default:
        return null;
    }
  }

  /**
   * Validate an individual value.
   */
  private isValidValue(
    value: any,
    definition: ParameterDefinition,
  ): boolean {
    switch (definition.type) {
      case ParameterType.INTEGER:
      case ParameterType.FLOAT:
        return (
          typeof value === 'number' &&
          value >= (definition.min ?? value) &&
          value <= (definition.max ?? value)
        );

      case ParameterType.BOOLEAN:
        return typeof value === 'boolean';

      case ParameterType.ENUM:
        return (
          definition.values?.includes(value) ??
          false
        );

      default:
        return false;
    }
  }

  /**
   * Cartesian product generator.
   */
  private cartesianProduct(
    matrix: {
      name: string;
      values: any[];
    }[],
  ): ParameterSet[] {
    let results: ParameterSet[] = [{}];

    for (const parameter of matrix) {
      const combinations: ParameterSet[] = [];

      for (const existing of results) {
        for (const value of parameter.values) {
          combinations.push({
            ...existing,
            [parameter.name]: value,
          });
        }
      }

      results = combinations;
    }

    return results;
  }
}
