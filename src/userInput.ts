import { createInterface } from 'readline';

function userInput() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
  }

  async function getUserInput() {
    const fromInput = await ask('From: ');
    const toInput = await ask('To: ');
    const [fr, fc] = fromInput.split(',').map(Number);
    const [tr, tc] = toInput.split(',').map(Number);

    return {
      fr,
      fc,
      tr,
      tc,
    };
  }

  return {
    getUserInput,
    cleanup() {
      rl.close();
    },
  };
}

export default userInput;
