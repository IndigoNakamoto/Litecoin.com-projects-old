function FormButton({ variant, children, ...rest }) {
  const buttonVariants = {
    enabled:
      'bg-[#222222] text-xl font-semibold py-2 px-4 rounded-node hover:opacity-75', // Existing styles
    // Add a more specific class
    enabledSpecific:
      'bg-[#222222] text-xl font-semibold py-2 px-4 rounded-node hover:opacity-75 specific-button-class',
    disabled: 'bg-[#f3ccc4] text-xl  py-2 px-4 rounded-node cursor-not-allowed',
  }

  return (
    <button className={buttonVariants[variant]} {...rest}>
      {children}
    </button>
  )
}

export default FormButton
