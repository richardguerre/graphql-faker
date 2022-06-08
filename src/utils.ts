import * as fs from 'fs';
import * as fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import {
  Source,
  GraphQLSchema,
  buildClientSchema,
  getIntrospectionQuery,
} from 'graphql';
import * as faker from 'faker';

export function existsSync(filePath: string): boolean {
  try {
    fs.statSync(filePath);
  } catch (err) {
    if (err.code == 'ENOENT') return false;
  }
  return true;
}

export function readSDL(filepath: string): Source {
  return new Source(fs.readFileSync(filepath, 'utf-8'), filepath);
}

export function getRemoteSchema(
  url: string,
  headers: { [name: string]: string },
): Promise<GraphQLSchema> {
  return graphqlRequest(url, headers, getIntrospectionQuery())
    .then((response) => {
      if (response.errors) {
        throw Error(JSON.stringify(response.errors, null, 2));
      }
      return buildClientSchema(response.data);
    })
    .catch((error) => {
      throw Error(`Can't get introspection from ${url}:\n${error.message}`);
    });
}

export function graphqlRequest(
  url,
  headers,
  query,
  variables?,
  operationName?,
) {
  return fetch(url, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...(headers || {}),
    }),
    body: JSON.stringify({
      operationName,
      query,
      variables,
    }),
  }).then((responce) => {
    if (responce.ok) return responce.json();
    return responce.text().then((body) => {
      throw Error(`${responce.status} ${responce.statusText}\n${body}`);
    });
  });
}

export const runFakerUsingPath = (fakerPath: string) => {
  if (fakerPath.slice(0, 6) !== 'faker.') {
    return 'relay-mock-default';
  }
  const path = fakerPath.slice(6).split('.');

  let func = faker as any;
  for (const el of path) {
    func = func[el];
  }

  if (typeof func === 'function') {
    return (func as Function)();
  }

  return 'provided faker path is not a function';
};

export const startsWithOneOf = (str: string, searchArr: string[]) => {
  let result = false;
  for (const key of searchArr) {
    if (str.startsWith(key)) {
      result = true;
    }
  }

  return result;
};
