from copy import deepcopy

from lxml.etree import Element


def prune_unwanted_nodes(tree: Element, nodelist, with_backup=False):
    """Prune the HTML tree by removing unwanted sections."""
    if with_backup:
        old_len = len(tree.text_content())  # ' '.join(tree.itertext())
        backup = deepcopy(tree)

    for expression in nodelist:
        for subtree in expression(tree):
            # preserve tail text from deletion
            if subtree.tail is not None:
                prev = subtree.getprevious()
                if prev is None:
                    prev = subtree.getparent()
                if prev is not None:
                    # There is a previous node, append text to its tail
                    prev.tail = (prev.tail or "") + " " + subtree.tail
            # remove the node
            subtree.getparent().remove(subtree)

    if with_backup:
        new_len = len(tree.text_content())
        # todo: adjust for recall and precision settings
        return tree if new_len > old_len / 7 else backup
    return tree
