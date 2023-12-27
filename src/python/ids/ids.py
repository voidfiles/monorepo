import string
import array

CHARSET_DEFAULT = string.ascii_lowercase + string.ascii_uppercase + string.digits + "_-~."

BASE = len(CHARSET_DEFAULT)

def encode(n, charset=CHARSET_DEFAULT):
    """Encodes a given integer ``n``."""

    chs = []
    while n > 0:
        n, r = divmod(n, BASE)
        chs.insert(0, charset[r])

    if not chs:
        return "0"

    return "".join(chs)


def encodebytes(barray, charset=CHARSET_DEFAULT):
    """Encodes a bytestring into a base62 string.

    :param barray: A byte array
    :type barray: bytes
    :rtype: str
    """

    _check_type(barray, bytes)

    # Count the number of leading zeros.
    leading_zeros_count = 0
    for i in range(len(barray)):
        if barray[i] != 0:
            break
        leading_zeros_count += 1

    # Encode the leading zeros as "0" followed by a character indicating the count.
    # This pattern may occur several times if there are many leading zeros.
    n, r = divmod(leading_zeros_count, len(charset) - 1)
    zero_padding = f"0{charset[-1]}" * n
    if r:
        zero_padding += f"0{charset[r]}"

    # Special case: the input is empty, or is entirely null bytes.
    if leading_zeros_count == len(barray):
        return zero_padding

    value = encode(int.from_bytes(barray, "big"), charset=charset)
    return zero_padding + value


def decode(encoded, charset=CHARSET_DEFAULT):
    """Decodes a base62 encoded value ``encoded``.

    :type encoded: str
    :rtype: int
    """
    _check_type(encoded, str)

    l, i, v = len(encoded), 0, 0
    for x in encoded:
        v += _value(x, charset=charset) * (BASE ** (l - (i + 1)))
        i += 1

    return v


def decodebytes(encoded, charset=CHARSET_DEFAULT):
    """Decodes a string of base62 data into a bytes object.

    :param encoded: A string to be decoded in base62
    :type encoded: str
    :rtype: bytes
    """

    leading_null_bytes = b""
    while encoded.startswith("0") and len(encoded) >= 2:
        leading_null_bytes += b"\x00" * _value(encoded[1], charset)
        encoded = encoded[2:]

    decoded = decode(encoded, charset=charset)
    buf = bytearray()
    while decoded > 0:
        buf.append(decoded & 0xFF)
        decoded //= 256
    buf.reverse()

    return leading_null_bytes + bytes(buf)


def _value(ch, charset):
    """Decodes an individual digit of a base62 encoded string."""

    try:
        return charset.index(ch)
    except ValueError:
        raise ValueError("base62: Invalid character (%s)" % ch)


def _check_type(value, expected_type):
    """Checks if the input is in an appropriate type."""

    if not isinstance(value, expected_type):
        msg = "Expected {} object, not {}".format(
            expected_type, value.__class__.__name__
        )
        raise TypeError(msg)
    
start = 10
increment = 1

def incr():
    start += increment

    return start

chars_to_numbers = []
for x in CHARSET_DEFAULT:
    start += increment
    chars_to_numbers += [start]

chars_and_numbers = dict(zip(CHARSET_DEFAULT, chars_to_numbers))

ids = "a4eC39HqLyjWDarjtT1zdp7dc"

if __name__ == "__main__":
    print(len(CHARSET_DEFAULT))
    print(ids)
    num_str = []
    for c in ids:
        num_str += [chars_and_numbers[c]]

    print(encodebytes(array.array("B", num_str).tobytes()))
    # print(b)
    # d = decodebytes(b)