import Header from '../Header';

export default function HeaderExample() {
  return (
    <div className="space-y-4">
      <Header />
      <Header 
        isLoggedIn={true} 
        shelterName="Happy Paws Rescue" 
        userType="shelter" 
      />
      <Header 
        isLoggedIn={true} 
        userType="volunteer" 
      />
    </div>
  );
}