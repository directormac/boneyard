import Image from 'next/image';

export function Logo() {
  return (
    <div className=''>
      <Image
        width={130}
        height={30}
        alt='Boneyard'
        src="/logo.png"
      />
      <p className='text-[10.5px] pt-1'>a simple skeleton package</p>
    </div>
  );
}
