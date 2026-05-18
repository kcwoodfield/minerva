import type { HTMLAttributes } from 'react';
import { formatBookTitle } from '../lib/formatBookTitle';

type Element = 'span' | 'div' | 'h2' | 'h3' | 'strong';

interface Props extends HTMLAttributes<HTMLElement> {
  title: string;
  as?: Element;
}

export function BookTitle({ title, as: Tag = 'span', ...props }: Props) {
  return <Tag {...props}>{formatBookTitle(title)}</Tag>;
}
