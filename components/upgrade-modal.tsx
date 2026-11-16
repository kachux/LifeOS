"use client";

export interface UpgradeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  [key: string]: any;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  ...props
}: UpgradeModalProps) {
  return null;
}
