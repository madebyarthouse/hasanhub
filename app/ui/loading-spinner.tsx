const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center gap-3">
      <span className="sr-only">Loading...</span>
      <div
        className="will-fade-scale bg-twitchPurple saturate-50 h-10 w-3"
        style={{
          animationDuration: "1000ms",
          animationName: "pulse",
          animationIterationCount: "infinite",
        }}
      ></div>
      <div
        className="will-fade-scale bg-twitchPurple saturate-50 h-10 w-3"
        style={{
          animationDuration: "1500ms",
          animationName: "pulse",
          animationIterationCount: "infinite",
        }}
      ></div>
      <div
        className="will-fade-scale bg-twitchPurple saturate-50 h-10 w-3"
        style={{
          animationDuration: "2000ms",
          animationName: "pulse",
          animationIterationCount: "infinite",
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
