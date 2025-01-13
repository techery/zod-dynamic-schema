# @techery/zod-dynamic-schema

[![npm version](https://badge.fury.io/js/@techery%2Fzod-dynamic-schema.svg)](https://www.npmjs.com/package/@techery/zod-dynamic-schema)
![CI Status](https://github.com/techery/zod-dynamic-schema/actions/workflows/pr-checks.yml/badge.svg?branch=main)


Type-safe factory functions for creating dynamic Zod schemas with TypeScript inference.

Developed by [Techery](https://techery.io).

## Motivation

This package was created to solve a specific challenge when working with LLM (Large Language Model) structured outputs. When building LLM applications, we often need to:

- Define structured output schemas that are mostly fixed but need certain parts to vary based on runtime state
- Maintain type safety while allowing dynamic schema modifications
- Create reusable schema templates that can be adjusted based on external data or application state

This helper provides a clean, type-safe way to create schema factories that can generate different variations of a base schema while maintaining consistent structure and type inference.

## Features

- Create reusable Zod schema factories with full TypeScript type inference
- Support for both parameterized and static schema generation
- Zero runtime overhead
- Lightweight with minimal dependencies
- Perfect for LLM structured output validation

## Installation

```bash
npm install @techery/zod-dynamic-schema zod
```

## Usage

### Real-World Example: Dynamic Form Widget

This example shows how to create a schema for a form widget where the options and validation rules can be dynamically configured based on the context:

```typescript
import { z } from 'zod';
import { schemaFactory } from '@techery/zod-dynamic-schema';

interface DynamicOptions {
  minItems?: number;
  maxItems?: number;
  instructions?: string;
}

const dynamicOptionsWidgetSchemaFactory = schemaFactory((dynamicOptions: DynamicOptions) => {
  return z.object({
    type: z.literal("options").describe("Options widget type"),
    options: z
      .array(
        z.object({
          name: z.string().describe("Name of the option"),
        })
      )
      .min(dynamicOptions.minItems ?? 2)
      .max(dynamicOptions.maxItems ?? 10)
      .describe(dynamicOptions.instructions),
    multiSelect: z.boolean().describe("Whether the user can select multiple options"),
  });
});

// Create different variants based on context
const singleChoiceQuestion = dynamicOptionsWidgetSchemaFactory({
  minItems: 2,
  maxItems: 4,
  instructions: "Please provide 2-4 options for single choice question"
});

const multipleChoiceQuestion = dynamicOptionsWidgetSchemaFactory({
  minItems: 3,
  maxItems: 6,
  instructions: "Please provide 3-6 options for multiple choice question"
});

// Type inference works perfectly
type SingleChoiceWidget = z.infer<typeof singleChoiceQuestion>;
// {
//   type: "options";
//   options: { name: string }[];  // with min(2) and max(4) constraints
//   multiSelect: boolean;
// }
```

### LLM Output Schema Example

```typescript
import { z } from 'zod';
import { schemaFactory } from '@techery/zod-dynamic-schema';

// Define a factory for LLM response schema that varies based on allowed actions
interface ActionSchemaParams {
  allowedActions: string[];
  requireReasoning: boolean;
}

const llmResponseSchema = schemaFactory((params: ActionSchemaParams) => {
  const actionEnum = z.enum(params.allowedActions as [string, ...string[]]);
  
  return z.object({
    action: actionEnum,
    parameters: z.record(z.string(), z.any()),
    confidence: z.number().min(0).max(1),
    reasoning: params.requireReasoning 
      ? z.string().min(1)
      : z.string().optional(),
  });
});

// Create different variants based on context
const chatbotResponse = llmResponseSchema({
  allowedActions: ['reply', 'ask_clarification', 'end_conversation'],
  requireReasoning: true,
});

const dataAnalysisResponse = llmResponseSchema({
  allowedActions: ['analyze_data', 'request_more_data', 'provide_insights'],
  requireReasoning: false,
});
```

### Field Extraction Example

```typescript
import { z } from 'zod';
import { schemaFactory } from '@techery/zod-dynamic-schema';

// Create a schema factory for structured field extraction
const fieldExtractionSchema = schemaFactory((fields: string[]) =>
  z.object({
    extracted_fields: z.object(
      fields.reduce((acc, field) => ({
        ...acc,
        [field]: z.string(),
      }), {})
    ),
    confidence_scores: z.object(
      fields.reduce((acc, field) => ({
        ...acc,
        [field]: z.number().min(0).max(1),
      }), {})
    ),
  })
);

// Use with different field sets
const nameExtractor = fieldExtractionSchema(['firstName', 'lastName']);
const addressExtractor = fieldExtractionSchema([
  'street',
  'city',
  'state',
  'zipCode'
]);
```

## Type Information

The package exports the following types:

```typescript
type SchemaFactory<I, Z extends z.ZodTypeAny> = {
  $type: z.infer<Z>;
  (input: I): Z;
  (): Z;
};
```

## Authors

- [Serge Zenchenko](https://github.com/sergezenchenko) - CTO at [Techery](https://techery.io)

## License

MIT