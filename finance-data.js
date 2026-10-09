/* Educational assumptions only; percentages are annual, not forecasts. */
(function(g){'use strict';const data={principal:1000000,defaults:[20,30,30,20],assets:[
{name:'입출금성 예금',color:'#00462a',info:'필요할 때 출금하기 쉽지만 일반적으로 이자 수익이 낮습니다.'},
{name:'정기 예금',color:'#75866c',info:'1년 만기, 가입 당시 연 3% 약정. 중도 해지하면 이자 조건이 달라집니다.'},
{name:'주식',color:'#b08344',info:'기업의 지분입니다. 가격 변동과 배당 가능성이 있으며 원금 손실 위험이 있습니다.'},
{name:'채권',color:'#536e80',info:'정부·기업이 정해진 조건에 따라 원리금을 지급하기로 약속한 증서입니다. 신용 위험과 가격 변동 위험이 있습니다. 여기서는 만기가 1년보다 긴 고정금리 채권을 1년 뒤 시장 가격으로 평가합니다.'}],
scenarios:[
{id:'rates',lesson:'시장 금리가 오르면 기존 고정금리 채권의 가격은 일반적으로 하락할 수 있습니다. 약정 이자와 시장 가격을 구분하세요. 기존 정기 예금의 약정 금리는 그대로입니다. 실제 영향은 만기·발행 조건·경기 등에 따라 다릅니다.',name:'금리 상승',desc:'시장 금리가 오릅니다. 기존 고정금리 채권의 가격은 어떻게 될까요?',inflation:.02,interest:[.02,.03,0,.03],price:[0,0,-.08,-.06],dividend:[0,0,.01,0]},
{id:'inflation',lesson:'명목 금액이 늘어도 물가가 더 빠르게 오르면 실질 구매력은 줄어들 수 있습니다. 초기 100만 원과 물가를 반영한 금액을 비교해 보세요.',name:'물가 상승',desc:'물가가 연 6% 오릅니다. 돈의 금액과 살 수 있는 양을 비교해 보세요.',inflation:.06,interest:[.01,.03,0,.03],price:[0,0,.02,-.02],dividend:[0,0,.01,0]},
{id:'recession',lesson:'이 상황에서는 기본 분산 포트폴리오에도 손실이 발생합니다. 여러 자산으로 나누어도 동시에 가격이 하락하는 위험을 모두 없앨 수는 없습니다.',name:'경기 침체',desc:'기업 실적이 위축되고 주식과 채권의 가격이 함께 하락하는 가상 상황입니다.',inflation:.01,interest:[.01,.03,0,.03],price:[0,0,-.25,-.07],dividend:[0,0,0,0]},
{id:'recovery',lesson:'이 상황에서는 주식 집중 배분의 수익이 더 클 수 있습니다. 한 상황의 높은 수익만으로 더 나은 배분이라고 판단하지 마세요. 경기 침체 결과와 함께 비교해 보세요.',name:'경기 회복',desc:'기업 실적과 투자 여건이 개선됩니다. 집중 투자와 분산 투자를 비교해 보세요.',inflation:.02,interest:[.01,.03,0,.03],price:[0,0,.15,.02],dividend:[0,0,.01,0]}],
emergency:{months:6,deadline:7,need:300000,price:[0,0,-.10,-.04],interest:[.01*.5,.005*.5,0,.03*.5],fee:[0,0,.002,.001],days:[0,0,2,10],foregone:[0,(.03-.005)*.5,0,0]}};
if(typeof module==='object'&&module.exports)module.exports=data;else g.GalpiFinanceData=data;
})(typeof window==='undefined'?globalThis:window);
