import ReactModal from 'react-modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

type ModalProps = {
  isOpen: boolean
  onRequestClose: () => void
}

const DonationInfoModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const focusStyle = {
    outline: 'none',
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className="h-full max-h-[98vh] min-h-[50vh] max-w-[44rem] overflow-y-auto overflow-x-hidden border border-black bg-[#f0f0f0] p-8 shadow-xl sm:m-8 sm:h-min sm:w-full md:p-16"
      overlayClassName="fixed inset-0 bg-[#222222] bg-opacity-80 z-[40] flex items-center justify-center transform duration-400 ease-in"
      // Remove appElement if set globally
    >
      <div className="relative flex justify-end text-[#f46748]">
        <FontAwesomeIcon
          key="close-icon"
          icon={faClose}
          className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
          onClick={onRequestClose}
        />
      </div>
      <div className="items-center space-y-4 py-4">
        <div className="">
          <div className="mt-4 flex flex-col">
            <h1 className="font-regular text-center font-sans text-4xl text-[#f46748]">
              Donation Transparency
            </h1>
            <div className="mt-4 space-y-4">
              <p>
                The Litecoin Foundation is a registered non-profit organization
                dedicated to advancing Litecoin and blockchain technology
                through open-source development. Your support is vital to our
                mission.
              </p>
              <div>
                <h2 className="font-regular font-sans text-2xl text-[#f46748]">
                  Service Fee
                </h2>
                <p>
                  A 15% service fee is applied to each donation to cover
                  operational costs, including administrative and marketing
                  expenses that help us grow our impact.
                </p>
              </div>
              <div>
                <h2 className="font-regular font-sans text-2xl text-[#f46748]">
                  Fund Allocation
                </h2>
                <p>
                  While we always strive to honor the donor's intent, the
                  Litecoin Foundation's Open Source Fund Council reserves the
                  right to reallocate funds between supported projects as
                  needed. This ensures we can adapt to changing priorities and
                  support the ecosystem most effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReactModal>
  )
}

export default DonationInfoModal
