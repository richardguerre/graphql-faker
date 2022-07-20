import { fakerTypes } from './src/fakerTypes';
import { runFakerUsingPath } from './src/utils';
// import { faker } from '@faker-js/faker';

for (const fakerType of fakerTypes) {
  const { type } = fakerType;
  console.log(type);
  console.log({ result: runFakerUsingPath(type) });
}
