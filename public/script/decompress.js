function decompress(compressedBuffer) {
  'use strict';
  const outputArray = [];

  const MAXDICT = 4096;
  const BUFFER = 4096;

  let header;
  let dictionary_bits;
  let dictionary_size;

  let queue = new Array(MAXDICT);
  let queue_head;
  let queue_tail;
  let queue_count;

  let bitstream = new Array(BUFFER * 8);
  let buffer;
  let inbuffer;
  let buffer_offset;

  let loopIndex = 0;

  function get_bit(x, n) {
    return ((x >> n) & 1);
  }

  function set_bit(x, n) {
    return (x |= (1 << n));
  }

  function queue_init() {
    queue_head = 0;
    queue_tail = -1;
    queue_count = 0;
  }

  function queue_pop() {
    queue_head++;
    queue_count--;

    if (queue_head === dictionary_size) {
      queue_head = 0;
    }
  }

  function queue_push(key) {
    if (queue_count === dictionary_size) {
      queue_pop();
    }

    if (++queue_tail === dictionary_size) {
      queue_tail = 0;
    }

    queue[queue_tail] = key;
    queue_count++;
  }

  function getbits(n) {
    let i;
    let j;
    let x;

    if (inbuffer === 0) {
      buffer = new Uint8Array(compressedBuffer.slice(loopIndex * BUFFER, (loopIndex + 1) * BUFFER));
      x = buffer.length;
      loopIndex++;

      if (x === 0) {
        return 0xFFFF;
      }

      for (i = 0; i < x; i++) {
        for (j = 0; j < 8; j++) {
          bitstream[(i << 3) + j] = buffer[i] & 1;
          buffer[i] >>= 1;
        }
      }

      inbuffer = (x << 3);
      buffer_offset = 0;
    } else if (inbuffer < n) {
      i = inbuffer;
      x = getbits(i);
      return x | (getbits(n - i) << i);
    }

    x = 0;
    for (i = 0; i < n; i++) {
      if (bitstream[buffer_offset + i] !== 0) {
        x = set_bit(x, i);
      }
    }

    inbuffer -= n;
    buffer_offset += n;
    return x;
  }

  function getreversebits(n) {
    let i;
    let x;
    let r = 0;

    x = getbits(n);

    for (i = 0; i < n; i++) {
      if (get_bit(x, n - i - 1) !== 0) {
        r = set_bit(r, i);
      }
    }

    return r;
  }

  function getcopylength() {
    if (getbits(1) !== 0) {
      if (getbits(1) !== 0) {
        return 3;
      } else {
        return ((getbits(1) !== 0) ? 2 : 4);
      }
    }

    if (getbits(1) !== 0) {
      if (getbits(1) !== 0) {
        return 5;
      } else {
        return ((getbits(1) !== 0) ? 6 : 7);
      }
    }

    if (getbits(1) !== 0) {
      if (getbits(1) !== 0) {
        return 8;
      } else {
        return ((getbits(1) !== 0) ? 9 : 10 + getbits(1));
      }
    }

    if (getbits(1) !== 0) {
      if (getbits(1) !== 0) {
        return (12 + getbits(2));
      } else {
        return (16 + getbits(3));
      }
    }

    if (getbits(1) !== 0) {
      if (getbits(1) !== 0) {
        return (24 + getbits(4));
      } else {
        return (40 + getbits(5));
      }
    }

    if (getbits(1) !== 0) {
      return (72 + getbits(6));
    }

    if (getbits(1) !== 0) {
      return (136 + getbits(7));
    }

    return (264 + getbits(8));
  }

  function getcopyoffsethighorder() {
    let x;

    if (getbits(1) !== 0) {
      if (getbits(1) !== 0) {
        return 0x00;
      }

      if (getbits(1) !== 0) {
        return (0x02 - getbits(1));
      } else {
        return (0x06 - getreversebits(2));
      }
    }

    if (getbits(1) !== 0) {
      x = getreversebits(4);

      if (x !== 0) {
        return (0x16 - x);
      } else {
        return (0x17 - getbits(1));
      }
    }

    if (getbits(1) !== 0) {
      return (0x27 - getreversebits(4));
    }

    if (getbits(1) !== 0) {
      return (0x2F - getreversebits(3));
    }

    return (0x3F - getreversebits(4));
  }

  let x;
  let p;
  let length;
  let offset;
  let ch;

  inbuffer = 0;
  queue_init();

  header = getbits(8);
  dictionary_bits = getbits(8);
  dictionary_size = 64 << dictionary_bits;

  if (header !== 0 || dictionary_size > MAXDICT) {
    throw new Error("Error parsing file. Check to be sure it is a valid civ3 compressed SAV/BIQ/BIX/BIC file.");
  }

  for (;;) {
    x = getbits(1);

    if (x === 0) {
      ch = getbits(8);
      outputArray.push(ch);
      queue_push(ch);
    } else {
      length = getcopylength();
      if (length === 519) {
        break;
      }

      if (length !== 2) {
        offset = getcopyoffsethighorder() << dictionary_bits;
        offset |= getbits(dictionary_bits);
      } else {
        offset = getcopyoffsethighorder() << 2;
        offset |= getbits(2);
      }

      offset %= queue_count;

      if (queue_tail >= offset) {
        offset = queue_tail - offset;
      } else {
        offset = dictionary_size - (offset - queue_tail);
      }

      while (length-- != 0) {
        outputArray.push(queue[offset]);
        queue_push(queue[offset++]);

        if (offset === dictionary_size) {
          offset = 0;
        }
      }
    }
  }

  return outputArray;
};
