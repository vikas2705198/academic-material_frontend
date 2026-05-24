import Navbar from "../components/Navbar";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-gray-100 overflow-hidden font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32 flex flex-col lg:flex-row items-center justify-between z-10">
        
        {/* Left Content */}
        <div className="lg:w-1/2 text-center lg:text-left mb-16 lg:mb-0 relative z-20">
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Web3 Knowledge Platform</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
            Immortalize Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
              Academic Legacy
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
            Mint your research papers, study notes, and thesis documents as verifiable NFTs on the blockchain. Ensure academic integrity and trade your intellectual property securely.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              href="/mint"
              className="px-8 py-4 w-full sm:w-auto text-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Mint Material Now
            </Link>
            <Link 
              href="/marketplace"
              className="px-8 py-4 w-full sm:w-auto text-center rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="lg:w-1/2 relative flex justify-center items-center z-10">
          {/* Glowing background blob */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-600/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          {/* Main Hero Image */}
          <div className="relative w-full max-w-md lg:max-w-lg aspect-square drop-shadow-[0_0_50px_rgba(79,70,229,0.3)] animate-float">
            <Image 
              src="/hero.png" 
              alt="Futuristic Academic Blockchain Book" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

      </div>

      {/* Decorative Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

    </div>
  );
}